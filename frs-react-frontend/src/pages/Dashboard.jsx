import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';
import { getRentalStats, getFurnitureStats, getRecentRentals, getOverdueRentals } from '../services/api';

const Dashboard = () => {
    const [rentalStats, setRentalStats] = useState({ totalRentals: 0, activeRentals: 0, overdueRentals: 0, totalRevenue: 0 });
    const [inventoryStats, setInventoryStats] = useState({ total: 0, available: 0, byCategory: {} });
    const [recentRentals, setRecentRentals] = useState([]);
    const [overdueRentalsList, setOverdueRentalsList] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rStats, iStats, recent, overdue] = await Promise.all([
                    getRentalStats(),
                    getFurnitureStats(),
                    getRecentRentals(),
                    getOverdueRentals(),
                ]);
                setRentalStats(rStats.data);
                setInventoryStats(iStats.data);
                setRecentRentals(recent.data);
                setOverdueRentalsList(overdue.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, []);

    return (
        <Layout
            title="Dashboard"
            subtitle="Overview of your rental operations"
            actions={<Link to="/rentals" className="btn btn-primary"><i className="fas fa-plus"></i> New Rental</Link>}
        >
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--info)' }}><FileText /></div>
                    <div className="stat-label">Total Rentals</div>
                    <div className="stat-value">{rentalStats.totalRentals}</div>
                    <div className="stat-sub">All time</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--success)' }}><CheckCircle /></div>
                    <div className="stat-label">Active Rentals</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{rentalStats.activeRentals}</div>
                    <div className="stat-sub">Currently rented</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--danger)' }}><AlertTriangle /></div>
                    <div className="stat-label">Overdue</div>
                    <div className="stat-value" style={{ color: 'var(--danger)' }}>{rentalStats.overdueRentals}</div>
                    <div className="stat-sub">Needs attention</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ color: 'var(--accent)' }}><DollarSign /></div>
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>${rentalStats.totalRevenue?.toLocaleString()}</div>
                    <div className="stat-sub">From returned rentals</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Inventory Overview</div>
                        <Link to="/furniture" className="btn btn-outline btn-sm">View All</Link>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem' }}>{inventoryStats.total}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>Total Items</div>
                        </div>
                        <div style={{ flex: 1, background: 'var(--bg)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--success)' }}>{inventoryStats.available}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: '4px' }}>Available</div>
                        </div>
                    </div>

                    {inventoryStats.byCategory && Object.entries(inventoryStats.byCategory).map(([category, count]) => (
                        <div key={category} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--muted)' }}>{category}</span>
                                <span style={{ fontWeight: 600 }}>{count}</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: 'var(--accent)',
                                    borderRadius: '2px',
                                    width: `${inventoryStats.total > 0 ? (count * 100 / inventoryStats.total) : 0}%`
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card">
                    <div className="card-header">
                        <div className="card-title">Overdue Rentals</div>
                        <span className="badge badge-danger">{overdueRentalsList.length} overdue</span>
                    </div>
                    {overdueRentalsList.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                            <p>No overdue rentals!</p>
                        </div>
                    ) : (
                        overdueRentalsList.map(r => (
                            <div key={r.orderNumber} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{r.customerName}</div>
                                        <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{r.furnitureName}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="badge badge-danger">Overdue</span>
                                        <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '4px' }}>Due: <span>{new Date(r.endDate).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <div className="card-header">
                    <div className="card-title">Recent Rentals</div>
                    <Link to="/rentals" className="btn btn-outline btn-sm">View All</Link>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Item</th>
                                <th>Period</th>
                                <th>Cost</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRentals.length === 0 ? (
                                <tr>
                                    <td colSpan="7"><div className="empty-state"><p>No rentals yet.</p></div></td>
                                </tr>
                            ) : (
                                recentRentals.map(r => (
                                    <tr key={r.orderNumber}>
                                        <td style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '.8rem' }}>{r.orderNumber}</td>
                                        <td>{r.customerName}</td>
                                        <td>{r.furnitureName}</td>
                                        <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                                            {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--accent)' }}>${Number(r.totalCost).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'ACTIVE' ? 'badge-success' :
                                                    r.status === 'RETURNED' ? 'badge-muted' :
                                                        r.status === 'OVERDUE' ? 'badge-danger' : 'badge-info'
                                                }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td><Link to={`/rentals/${r.orderNumber}`} className="btn btn-outline btn-sm">View</Link></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
