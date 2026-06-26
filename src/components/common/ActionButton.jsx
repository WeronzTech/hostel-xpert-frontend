import { Button, ConfigProvider } from "antd";

const ActionButton = ({
  customTheme = {
    token: {
      colorPrimary: "#059669",
    },
  },
  type = "primary",
  children,
  ...rest
}) => {
  return (
    <ConfigProvider theme={customTheme}>
      <Button {...rest} type={type}>
        {children}
      </Button>
    </ConfigProvider>
  );
};

export default ActionButton;