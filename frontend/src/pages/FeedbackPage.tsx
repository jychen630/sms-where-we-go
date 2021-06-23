import { Card, Tabs, Layout } from 'antd';
import { useState } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import Feedbacks from '../components/Feedbacks';
import AppPage, { menuOptions } from './AppPage';

const FeedbackPage = () => {
    const [count, setCount] = useState(0);
    return (
        <AppPage activeKey={menuOptions.FEEDBACK}>
            <Layout className='centered-layout'>
                <Layout.Content>
                    <Card>
                        <Tabs defaultActiveKey='add'>
                            <Tabs.TabPane tab='添加' key='add'>
                                <FeedbackForm isPublic={false} cb={() => setCount(count + 1)} />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab='查看' key='view'>
                                <Feedbacks adminView={false} count={count} />
                            </Tabs.TabPane>
                        </Tabs>
                    </Card>
                </Layout.Content>
            </Layout>
        </AppPage>
    )
}

export default FeedbackPage;
