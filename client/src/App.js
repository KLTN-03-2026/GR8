import { Layout, Typography } from "antd";
import ApartmentList from "./pages/ApartmentList.jsx";
import "./App.css";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 shadow-sm">
        <Title level={3} className="m-0">
          Hệ thống Quản lý Chung cư
        </Title>
      </Header>

      <Content className="p-6 bg-gray-100">
        <ApartmentList />
      </Content>
    </Layout>
  );
}

export default App;
