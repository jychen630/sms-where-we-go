import Form from "react-bootstrap/Form";

const FormErrorMessage = (props: { message?: string }) => {
  if (props.message === undefined || props.message.length === 0) {
    return <div></div>;
  }
  return (
    <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
      {props.message}
    </Form.Control.Feedback>
  );
};

export default FormErrorMessage;
