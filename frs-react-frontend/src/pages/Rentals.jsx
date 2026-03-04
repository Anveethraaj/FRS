import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Check, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { getRentals, getAvailableFurniture, createRental } from '../services/api';

const STATUSES = ['ACTIVE', 'OVERDUE', 'RETURNED'];

const Rentals = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedStatus = searchParams.get('status');

    const [rentals, setRentals] = useState([]);
    const [furniture, setFurniture] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showNewModal, setShowNewModal] = useState(false);
    const [newForm, setNewForm] = useState({ customerName: '', customerEmail: '', customerId: '', furnitureId: '', startDate: '', endDate: '' });
    const [previewCost, setPreviewCost] = useState(0);

    useEffect(() => {
        fetchRentals();
        fetchFurniture();
    }, [selectedStatus]);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const res = await getRentals();
            let data = res.data;
            if (selectedStatus) {
                data = data.filter(r => r.status === selectedStatus);
            }
            setRentals(data);
        } catch (error) {
            console.error(error);
            alert('Error fetching rentals');
        } finally {
            setLoading(false);
        }
    };

    const fetchFurniture = async () => {
        try {
            const res = await getAvailableFurniture();
            setFurniture(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFilter = (status) => {
        const newParams = new URLSearchParams(searchParams);
        if (status === 'all') {
            newParams.delete('status');
        } else {
            newParams.set('status', status);
        }
        setSearchParams(newParams);
    };

    const updatePreview = (form) => {
        if (!form.furnitureId || !form.startDate || !form.endDate) return;
        const f = furniture.find(x => x.id === parseInt(form.furnitureId));
        if (!f) return;

        const start = new Date(form.startDate);
        const end = new Date(form.endDate);
        const days = Math.max(1, Math.round((end - start) / 86400000));
        const cost = f.dailyRate * days;
        setPreviewCost(cost);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        const nextForm = { ...newForm, [name]: value };
        setNewForm(nextForm);
        updatePreview(nextForm);
    };

    const handleCreate = async () => {
        const payload = {
            furnitureId: parseInt(newForm.furnitureId),
            customerId: parseInt(newForm.customerId),
            customerName: newForm.customerName.trim(),
            customerEmail: newForm.customerEmail.trim(),
            startDate: newForm.startDate,
            endDate: newForm.endDate
        };

        if (!payload.furnitureId || !payload.customerId || !payload.customerName || !payload.startDate || !payload.endDate) {
            alert('Please fill all required fields');
            return;
        }

        try {
            await createRental(payload);
            setShowNewModal(false);
            setNewForm({ customerName: '', customerEmail: '', customerId: '', furnitureId: '', startDate: '', endDate: '' });
            fetchRentals();
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 409 && data?.nextAvailableDate) {
                alert(`${data.message || ''} Next available: ${data.nextAvailableDate}.`);
            } else {
                alert(data?.message || 'Error creating rental');
            }
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <Layout
            title="Rentals"
            subtitle="Manage rental orders and returns"
            actions={<button className="btn btn-primary" onClick={() => setShowNewModal(true)}><Plus size={16} /> New Rental</button>}
        >
            <div className="filter-bar">
                <button
                    className={`filter-btn ${!selectedStatus ? 'active' : ''}`}
                    onClick={() => handleFilter('all')}
                >All</button>
                {STATUSES.map(s => (
                    <button
                        key={s}
                        className={`filter-btn ${selectedStatus === s ? 'active' : ''}`}
                        onClick={() => handleFilter(s)}
                    >{s}</button>
                ))}
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Order #</th><th>Customer</th><th>Item</th><th>Period</th>
                                <th>Days</th><th>Cost</th><th>Deposit</th><th>Status</th><th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9"><div className="empty-state"><p>Loading...</p></div></td></tr>
                            ) : rentals.length === 0 ? (
                                <tr>
                                    <td colSpan="9">
                                        <div className="empty-state">
                                            <FileText size={48} style={{ margin: '0 auto', opacity: 0.4 }} />
                                            <p>No rentals found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                rentals.map(r => (
                                    <tr key={r.orderNumber}>
                                        <td style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '.82rem' }}>{r.orderNumber}</td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{r.customerName}</div>
                                            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{r.customerEmail}</div>
                                        </td>
                                        <td>
                                            <div>{r.furnitureName}</div>
                                            <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{r.furnitureCode}</div>
                                        </td>
                                        <td style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                                            <div>{new Date(r.startDate).toLocaleDateString()}</div>
                                            <div>to <span>{new Date(r.endDate).toLocaleDateString()}</span></div>
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.rentalDays}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>${Number(r.totalCost).toFixed(2)}</td>
                                        <td style={{ color: 'var(--muted)' }}>${Number(r.deposit).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'ACTIVE' ? 'badge-success' :
                                                    r.status === 'RETURNED' ? 'badge-muted' :
                                                        r.status === 'OVERDUE' ? 'badge-danger' : 'badge-info'
                                                }`}>{r.status}</span>
                                        </td>
                                        <td>
                                            <Link to={`/rentals/${r.orderNumber}`} className="btn btn-outline btn-sm"><Eye size={14} /></Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showNewModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                    <div className="modal">
                        <h2 className="modal-title">Create New Rental</h2>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Customer Name *</label>
                                <input className="form-control" name="customerName" placeholder="Full name" value={newForm.customerName} onChange={handleFormChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Customer Email *</label>
                                <input className="form-control" name="customerEmail" type="email" placeholder="email@example.com" value={newForm.customerEmail} onChange={handleFormChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Customer ID *</label>
                            <input className="form-control" name="customerId" type="number" placeholder="e.g. 1001" value={newForm.customerId} onChange={handleFormChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Furniture *</label>
                            <select className="form-control" name="furnitureId" value={newForm.furnitureId} onChange={handleFormChange}>
                                <option value="">Select available furniture</option>
                                {furniture.map(f => (
                                    <option key={f.id} value={f.id}>
                                        {f.name} ({f.code}) - ${f.dailyRate}/day
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Start Date *</label>
                                <input className="form-control" name="startDate" type="date" min={today} value={newForm.startDate} onChange={handleFormChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date *</label>
                                <input className="form-control" name="endDate" type="date" min={today} value={newForm.endDate} onChange={handleFormChange} />
                            </div>
                        </div>

                        {newForm.furnitureId && newForm.startDate && newForm.endDate && (
                            <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '14px', fontSize: '.85rem', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: 'var(--muted)' }}>Estimated Cost:</span>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)' }}>${previewCost.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--muted)' }}>Deposit (20%):</span>
                                    <span style={{ fontWeight: 600 }}>${(previewCost * 0.2).toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowNewModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}><Check size={16} /> Create Rental</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Rentals;
