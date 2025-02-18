import React, { useContext, useState, useEffect } from 'react';
import { Layout, Input, Avatar, Badge, Button, Modal, List, Form, Input as AntdInput } from 'antd';
import { ToggleContext } from './store/ToggleContext';
import { UserOutlined, LogoutOutlined, BellOutlined, SearchOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartbeat, faEnvelopeOpen, faEnvelope, faEdit, faClose } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown } from 'antd';
import { LoginContext } from './store/LoginContext';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const Header = () => {
  const token = localStorage.getItem('token');
  const decodedToken = token ? jwtDecode(token) : null;
  const navigate = useNavigate();

  const Logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  const menu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Setting
      </Menu.Item>
      <Menu.Item onClick={Logout} key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const role = decodedToken?.role;
  const { Header } = Layout;
  const { collapsed, onClickHandler } = useContext(ToggleContext);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Vous avez un rendez-vous de Patient', read: false },
    { id: 2, message: 'Inscription Docteur', read: false },
    { id: 3, message: 'Vous avez un rendez-vous de Docteur', read: false },
  ]);
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/doctors/${decodedToken.userId}`, { headers: { authorization: `Bearer ${token}` } });
        const data = response.data;
        console.log(data);
        setProfileImage(data.imageUrl);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };

    if (token) {
      fetchProfileImage();
    }
  }, [token]);

  const showNotification = () => {
    setNotificationVisible(true);
  };

  const hideNotification = () => {
    setNotificationVisible(false);
  };

  const showProfile = () => {
    setProfileVisible(true);
  };

  const hideProfile = () => {
    setProfileVisible(false);
  };

  const toggleMessageReadStatus = (id) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: !notification.read };
      }
      return notification;
    });
    setNotifications(updatedNotifications);
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase();
  };

  return (
    <Header className="header flex items-center justify-between" style={{ maxHeight: '100%', padding: '0 25px' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined style={{ fontSize: '20px' }} /> : <MenuFoldOutlined style={{ fontSize: '20px' }} />}
        onClick={onClickHandler}
        style={{
          fontSize: '20px',
          marginRight: '30px',
          color: '#fff',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      />
      <div className="logo flex items-center">
        <FontAwesomeIcon icon={faHeartbeat} className="text-white text-2xl mr-2" beat />
        <span className="font-bold text-white text-2xl">ConsultaMed</span>
      </div>
      <div className="flex items-center ml-7 mr-auto">
        <Input placeholder="Rechercher..." prefix={<SearchOutlined />} className="w-48" />
      </div>
      <div className="flex items-center">
        <Avatar src={profileImage} className="bg-blue-950 mr-2" size={40}>
          {!profileImage && (decodedToken ? getInitials(decodedToken.name) : <UserOutlined />)}
        </Avatar>
        <div className="text-white text-lg font-semibold mr-4 cursor-pointer" onClick={showProfile}>
          <div>{decodedToken?.name}</div>
          <div className="text-sm">{role}</div>
        </div>
        <Badge count={notifications.filter(notification => !notification.read).length}>
          <BellOutlined className="text-white text-2xl mr-2" onClick={showNotification} />
        </Badge>
        <Dropdown overlay={menu}>
          <SettingOutlined className="text-white text-2xl ml-6" />
        </Dropdown>
      </div>
      <Modal
        title="Notifications"
        visible={notificationVisible}
        onCancel={hideNotification}
        footer={null}
      >
        <List
          dataSource={notifications}
          renderItem={item => (
            <List.Item className={item.read ? "text-gray-500 cursor-pointer" : "font-bold cursor-pointer flex items-center"}>
              <span className="mr-2" onClick={() => toggleMessageReadStatus(item.id)}>{item.message}</span>
              {item.read ? (
                <FontAwesomeIcon icon={faEnvelopeOpen} className="text-green-500 text-lg" />
              ) : (
                <FontAwesomeIcon icon={faEnvelope} className="text-red-600 text-lg" />
              )}
            </List.Item>
          )}
        />
      </Modal>
      <Modal
        title="Profile"
        visible={profileVisible}
        onCancel={hideProfile}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="Nom">
            <AntdInput defaultValue={decodedToken?.name} />
          </Form.Item>
          <Form.Item label="Rôle">
            <AntdInput defaultValue={role} />
          </Form.Item>
          <Link to="/profile">
            <Button onClick={hideProfile} type="primary" icon={<FontAwesomeIcon icon={faEdit} />} className="mr-2">
              Edit
            </Button>
          </Link>
          <Button onClick={hideProfile} icon={<FontAwesomeIcon icon={faClose} />}>
            Close
          </Button>
        </Form>
      </Modal>
    </Header>
  );
}

export default Header;
