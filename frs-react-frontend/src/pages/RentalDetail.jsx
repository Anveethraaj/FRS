import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, Undo } from 'lucide-react';
import Layout from '../components/Layout';
import { getRentalByOrderNo, extendRental, returnRental } from '../services/api';

const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

const RentalDetail = () => {
    const { orderNo } = useParams();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showExtendModal, setShowExtendModal] = useState(false);
    const [newEndDate, setNewEndDate] = useState('');

    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnForm, setReturnForm] = useState({ condition: 'EXCELLENT', damageNotes: '', damageCharge: '' });

    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [summaryData, setSummaryData] = useState(null);

    useEffect(() => {
        fetchDetail();
    }, [orderNo]);

    const fetchDetail = async () => {
        try {
            const res = await getRentalByOrderNo(orderNo);
            setRental(res.data);
        } catch (err) {
            console.error(err);
            alert('Error fetching rental details');
        } finally {
            setLoading(false);
        }
    };

    const handleExtend = async () => {
        if (!newEndDate) { alert('Please select a date'); return; }
        try {
            await extendRental(orderNo, { newEndDate });
            setShowExtendModal(false);
            fetchDetail();
        } catch (err) {
            const data = err.response?.data;
            if (err.response?.status === 400 && data?.daysOverdue !== undefined) {
                alert(data.message || `This rental is overdue by ${data.daysOverdue} day(s). Please process return first.`);
                setShowExtendModal(false);
                setShowReturnModal(true);
            } else if (err.response?.status === 409 && data?.nextAvailableDate) {
                alert(`${data.message || ''} Next available: ${data.nextAvailableDate}.`);
            } else {
                alert(data?.message || 'Failed to extend rental.');
            }
        }
    };

    const handleReturn = async () => {
        const payload = {
            returnCondition: returnForm.condition,
            damageNotes: returnForm.damageNotes,
            damageCharge: parseFloat(returnForm.damageCharge) || 0
        };
        try {
            const res = await returnRental(orderNo, payload);
            setShowReturnModal(false);
            setSummaryData(res.data);
            setShowSummaryModal(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing return');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!rental) return <div>Rental not found</div>;

    return (
        <Layout
            title={rental.orderNumber}
            subtitle="Rental detail and management"
            actions={
                <>
                    <Link to="/rentals" className="btn btn-outline"><ArrowLeft size={16} /> Back</Link>

                    {rental.status !== 'RETURNED' && (
                        <button
                            className="btn btn-outline"
                            disabled={rental.status === 'OVERDUE'}
                            title={rental.status === 'OVERDUE' ? 'Cannot extend an overdue rental. Please process return.' : ''}
                            onClick={() => setShowExtendModal(true)}
                        >
                            <CalendarPlus size={16} /> Extend
                        </button>
                    )}

                    {['ACTIVE', 'EXTENDED', 'OVERDUE'].includes(rental.status) && (
                        <button className="btn btn-success" onClick={() => setShowReturnModal(true)}>
                            <Undo size={16} /> Process Return
                        </button>
                    )}
                </>
            }
        >
            <div className="grid-2">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div className="card-title" style={{ marginBottom: 0 }}>Rental Information</div>
                        <span className={`badge ${rental.status === 'ACTIVE' ? 'badge-success' :
                                rental.status === 'RETURNED' ? 'badge-muted' :
                                    rental.status === 'OVERDUE' ? 'badge-danger' : 'badge-info'
                            }`}>{rental.status}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Order Number</span>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{rental.orderNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Furniture</span>
                        <span style={{ fontWeight: 600 }}>{rental.furnitureName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Code</span>
                        <code style={{ color: 'var(--accent)' }}>{rental.furnitureCode}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Start Date</span>
                        <span>{new Date(rental.startDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>End Date</span>
                        <span>{new Date(rental.endDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Duration</span>
                        <span style={{ fontWeight: 600 }}>{rental.rentalDays} days</span>
                    </div>

                    {rental.returnDate && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                            <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Return Date</span>
                            <span>{new Date(rental.returnDate).toLocaleDateString()}</span>
                        </div>
                    )}

                    {rental.status === 'OVERDUE' && (
                        <div style={{ marginTop: '8px', fontSize: '.82rem', color: 'var(--danger)' }}>
                            This rental is overdue. Please process the return before attempting an extension.
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card">
                        <div className="card-title">Customer</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #96703e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#0f0f13', flexShrink: 0 }}>
                                {rental.customerName?.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{rental.customerName}</div>
                                <div style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{rental.customerEmail}</div>
                                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Customer ID: <span>{rental.customerId}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title">Cost Breakdown</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Rental Cost</span>
                                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent)' }}>${Number(rental.totalCost).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Deposit (20%)</span>
                                <span>${Number(rental.deposit).toFixed(2)}</span>
                            </div>
                            {rental.damageCharge > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                                    <span style={{ fontSize: '.85rem' }}>Damage Charge</span>
                                    <span>${Number(rental.damageCharge).toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 600 }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent)' }}>
                                    ${(rental.totalCost + (rental.damageCharge || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {rental.damageNotes && (
                        <div className="card">
                            <div className="card-title">Return Notes</div>
                            <p style={{ fontSize: '.875rem', color: 'var(--muted)' }}>{rental.damageNotes}</p>
                            {rental.returnCondition && (
                                <div style={{ marginTop: '10px' }}>
                                    <span className={`badge ${rental.returnCondition === 'EXCELLENT' ? 'badge-success' :
                                            rental.returnCondition === 'GOOD' ? 'badge-accent' :
                                                rental.returnCondition === 'FAIR' ? 'badge-warning' : 'badge-danger'
                                        }`}>Returned: {rental.returnCondition}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showExtendModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowExtendModal(false); }}>
                    <div className="modal">
                        <h2 className="modal-title">Extend Rental</h2>
                        <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '20px' }}>
                            Current end date: <strong style={{ color: 'var(--text)' }}>{new Date(rental.endDate).toLocaleDateString()}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">New End Date *</label>
                            <input className="form-control" type="date" min={rental.endDate} value={newEndDate} onChange={e => setNewEndDate(e.target.value)} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowExtendModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleExtend}><CalendarPlus size={16} /> Extend</button>
                        </div>
                    </div>
                </div>
            )}

            {showReturnModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowReturnModal(false); }}>
                    <div className="modal">
                        <h2 className="modal-title">Process Return</h2>
                        <div className="form-group">
                            <label className="form-label">Return Condition *</label>
                            <select className="form-control" value={returnForm.condition} onChange={e => setReturnForm({ ...returnForm, condition: e.target.value })}>
                                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Damage Notes</label>
                            <textarea className="form-control" rows="3" placeholder="Describe any damage..." value={returnForm.damageNotes} onChange={e => setReturnForm({ ...returnForm, damageNotes: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Damage Charge ($)</label>
                            <input className="form-control" type="number" step="0.01" min="0" placeholder="0.00" value={returnForm.damageCharge} onChange={e => setReturnForm({ ...returnForm, damageCharge: e.target.value })} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowReturnModal(false)}>Cancel</button>
                            <button className="btn btn-success" onClick={handleReturn}><Undo size={16} /> Process Return</button>
                        </div>
                    </div>
                </div>
            )}

            {showSummaryModal && summaryData && (
                <div className="modal-overlay open">
                    <div className="modal">
                        <h2 className="modal-title">Return Summary</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '.875rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--muted)' }}>Return Date</span><span>{new Date(summaryData.returnDate).toLocaleDateString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--muted)' }}>Base Cost</span><span>${Number(summaryData.baseCost).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--muted)' }}>Late Fee ({summaryData.lateDays} days)</span><span style={{ color: 'var(--danger)' }}>${Number(summaryData.lateFee).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--muted)' }}>Damage Charge</span><span style={{ color: 'var(--danger)' }}>${Number(summaryData.damageCharge).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 600 }}>Total Charges</span><span style={{ fontWeight: 700 }}>${Number(summaryData.totalCharges).toFixed(2)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(76,175,130,.08)', borderRadius: '8px', marginTop: '4px' }}><span style={{ color: 'var(--success)', fontWeight: 600 }}>Deposit Refund</span><span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>${Number(summaryData.depositRefund).toFixed(2)}</span></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={() => { setShowSummaryModal(false); fetchDetail(); }}>Done</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default RentalDetail;
