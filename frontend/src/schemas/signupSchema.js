import * as yup from "yup";

const passwordPattern  = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const erroMessage = "use lowercase, uppercase and digits";

const signupSchema = yup.object().shape({
  name: yup.string().min(5).max(30).required("name is required"),
  username: yup.string().min(5).max(30).required("username is required"),
  email: yup.string().email('enter a valid email.').required("email is required"),
  password: yup.string().matches(passwordPattern, { message: erroMessage }).required("Enter password"),
  confirmPassword: yup.string().oneOf([yup.ref('password')],'Confirm password must match.').required("Confirm password Invalid"),
});

export default signupSchema;