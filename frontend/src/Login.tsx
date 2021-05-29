import Rreact from 'react';
















// import React from 'react';
// //import Form from 'react-bootstrap/Form';
// //import Col from 'react-bootstrap/Col';
// //import Button from 'react-bootstrap/Button';
// //import 'bootstrap/dist/css/bootstrap.min.css';
// //import Card from 'react-bootstrap/Card';
// import MyFormInput from './MyFormInput';
// import { useForm } from 'react-hook-form';
// import { LoginForm } from './api/schemas';
// import { login } from './api/auth';
// import { Form, Input, Button, Checkbox, Card, Col, Row } from 'antd';


// function Login() {
//     const {
//         handleSubmit,
//         control,
//         formState: { errors }
//     } = useForm<LoginForm>();

//     const onSubmit = (data: LoginForm) => {
//         console.log(data);
//         login(data).then((data) => {
//             if (data.loginResult) {
//                 alert('success');
//             }
//             else {
//                 alert('fail to login: ' + data.message);
//             }
//         })
//     };

//     const layout = {
//         labelCol: { span: 8 },
//         wrapperCol: { span: 16 },
//     };

//     const tailLayout = {
//         wrapperCol: { offset: 8, span: 16 },
//     };

//     const onFinish = (values: any) => {
//         console.log('Success:', values);
//     };
//     const onFinishFailed = (errorInfo: any) => {
//         console.log('Failed:', errorInfo);
//     };
//     return (
//         <Card title="登录" >
//             <Form
//                 {...layout}
//                 name="basic"
//                 initialValues={{ remember: true }}
//                 onFinish={onFinish}
//                 onFinishFailed={onFinishFailed}
//             >


//                 <MyFormInput
//                     control={control as any}
//                     name="identifier"
//                     displayName="手机号码/邮箱"
//                     error={errors.identifier}
//                     errorMessage="此项为必填"
//                     placeholder="请输入手机号码"
//                     required={true}
//                 />

//                 <MyFormInput
//                     control={control as any}
//                     name="password"
//                     displayName="密码"
//                     controlProps={{ type: 'password' }}
//                     error={errors.password}
//                     errorMessage="此项为必填"
//                     placeholder="请输入密码"
//                     required={true}
//                 />

//                 <MyFormInput
//                     control={control as any}
//                     name="rememberMe"
//                     displayName=""
//                     required={false}
//                     altRender={
//                         ({ field: { onChange, value } }) => (
//                             <Checkbox onChange={onChange} value={value}>  自动登录 </Checkbox>
//                         )
//                     }
//                 />

//                 <Form.Item {...tailLayout}>
//                     <Button type="primary" htmlType="submit">
//                         登录
//             </Button>
//                     <Button type="primary" htmlType="submit" >
//                         去注册
//             </Button>
//                 </Form.Item>
//             </Form>

//         </Card>

//         /*
//         <Form
//             {...layout}
//             name="basic"
//             initialValues={{ remember: true }}
//             onFinish={onFinish}
//             onFinishFailed={onFinishFailed}
//         >
//             <Form.Item
//                 label="Username"
//                 name="username"
//                 rules={[{ required: true, message: 'Please input your username!' }]}
//             >
//                 <Input />
//             </Form.Item>

//             <Form.Item
//                 label="Password"
//                 name="password"
//                 rules={[{ required: true, message: 'Please input your password!' }]}
//             >
//                 <Input.Password />
//             </Form.Item>

//             <Form.Item {...tailLayout} name="remember" valuePropName="checked">
//                 <Checkbox>Remember me</Checkbox>
//             </Form.Item>

//             <Form.Item {...tailLayout}>
//                 <Button type="primary" htmlType="submit">
//                     Submit
//       </Button>
//             </Form.Item>
//         </Form>
//         */
//     );
// }
// export default Login;


// /*

// function Login() {


//     return (
//         <div className="Login">
//             <Card title="登录">


//                     <Form onSubmit={handleSubmit(onSubmit)} >
//                         <MyFormInput
//                             control={control as any}
//                             name="identifier"
//                             displayName="手机号码/邮箱"
//                             error={errors.identifier}
//                             errorMessage="此项为必填"
//                             placeholder="请输入手机号码"
//                             required={true}
//                         />

//                         <MyFormInput
//                             control={control as any}
//                             name="password"
//                             displayName="密码"
//                             controlProps={{ type: 'password' }}
//                             error={errors.password}
//                             errorMessage="此项为必填"
//                             placeholder="请输入密码"
//                             required={true}
//                         />

//                         <MyFormInput
//                             control={control as any}
//                             name="rememberMe"
//                             displayName=""
//                             required={false}
//                             altRender={
//                                 ({ field: { onChange, value } }) => (
//                                     <Form.Check onChange={onChange} value={value} type="checkbox" label="自动登录" />
//                                 )
//                             }
//                         />

//                         <Form.Item>
//                             <Col><Button variant="primary" type="submit">
//                                 登录
//                         </Button></Col>
//                             <Col> <Button variant="primary">
//                                 去注册
//                         </Button></Col>
//                         </Form.Item>
//                     </Form>

//             </Card>
//         </div>
//     );
// }
// */

// ///export default Login;