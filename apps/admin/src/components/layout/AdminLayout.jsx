import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ children, title = 'Dashboard' }) => {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar title={title} />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;