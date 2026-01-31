import {Button, ConfigProvider} from "antd";

const ActionButton = ({customTheme, type = "primary", children, ...rest}) => {
  return (
    <ConfigProvider theme={customTheme}>
      <Button {...rest} type={type}>
        {children}
      </Button>
    </ConfigProvider>
  );
};

export default ActionButton;
