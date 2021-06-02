import { BarsOutlined, CompassOutlined, SettingOutlined } from '@ant-design/icons';
import { Layout, Menu, Space } from 'antd';
import React from 'react';
import '../app.css';

const { Header, Content } = Layout;
const AppPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header className='app-header'>
                <Menu
                    mode='horizontal'
                >
                    <Menu.Item>
                        <Space>
                            <CompassOutlined /> 地图
                        </Space>
                    </Menu.Item>
                    <Menu.Item>
                        <Space>
                            <BarsOutlined /> 列表
                        </Space>
                    </Menu.Item>
                    <Menu.Item>
                        <Space>
                            <SettingOutlined /> 设置
                        </Space>
                    </Menu.Item>
                </Menu>
            </Header>
            <Content className='app-content'>
                <div className='app-content-container'>
                    {children}
                </div>
            </Content>
        </Layout>
    )
}

export default AppPage;
