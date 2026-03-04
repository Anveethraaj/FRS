import Sidebar from './Sidebar';

const Layout = ({ title, subtitle, actions, children }) => {
    return (
        <>
            <Sidebar />
            <div className="main">
                <div className="topbar">
                    <div className="topbar-title">
                        <h2>{title}</h2>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                    <div className="topbar-actions">
                        {actions}
                    </div>
                </div>
                <div className="page-content">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Layout;
