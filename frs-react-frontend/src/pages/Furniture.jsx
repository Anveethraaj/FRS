import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, LayoutGrid, Layers, Monitor, Archive, Edit, Trash2, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { getFurniture, createFurniture, updateFurniture, deleteFurniture } from '../services/api';

const CATEGORIES = ["SOFA", "TABLE", "CHAIR", "BED", "CABINET"];
const CONDITIONS = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
const BED_SIZES = ["SINGLE", "DOUBLE", "QUEEN", "KING"];

const getCategoryIcon = (category) => {
    switch (category) {
        case 'SOFA': return <Archive size={20} />;
        case 'TABLE': return <LayoutGrid size={20} />;
        case 'CHAIR': return <Layers size={20} />;
        case 'BED': return <Monitor size={20} />; // placeholder for bed
        case 'CABINET': return <Box size={20} />;
        default: return <Box size={20} />;
    }
};

const Furniture = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');
    const showAvailable = searchParams.get('available') === 'true';

    const [furniture, setFurniture] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [addForm, setAddForm] = useState({ code: '', name: '', category: '', dailyRate: '', condition: 'EXCELLENT', description: '', isRecliner: 'false', numberOfChairs: '', size: 'SINGLE' });
    const [editForm, setEditForm] = useState({ id: '', name: '', dailyRate: '', condition: '', available: 'true' });

    useEffect(() => {
        fetchFurniture();
    }, [selectedCategory, showAvailable]);

    const fetchFurniture = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedCategory) params.category = selectedCategory;
            if (showAvailable) params.available = true;
            const res = await getFurniture(params);
            setFurniture(res.data);
        } catch (error) {
            console.error(error);
            alert('Error fetching furniture');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (type, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (type === 'all') {
            newParams.delete('category');
            newParams.delete('available');
        } else if (type === 'category') {
            if (selectedCategory === value) newParams.delete('category');
            else newParams.set('category', value);
            newParams.delete('available');
        } else if (type === 'available') {
            newParams.delete('category');
            newParams.set('available', 'true');
        }
        setSearchParams(newParams);
    };

    const handleAddSubmit = async () => {
        const payload = {
            code: addForm.code.trim(),
            name: addForm.name.trim(),
            category: addForm.category,
            dailyRate: parseFloat(addForm.dailyRate),
            condition: addForm.condition,
            description: addForm.description.trim()
        };
        if (!payload.code || !payload.name || !payload.category || isNaN(payload.dailyRate)) {
            alert('Please fill all required fields');
            return;
        }
        if (addForm.category === 'SOFA') payload.isRecliner = addForm.isRecliner === 'true';
        if (addForm.category === 'TABLE') payload.numberOfChairs = parseInt(addForm.numberOfChairs) || 0;
        if (addForm.category === 'BED') payload.size = addForm.size;

        try {
            await createFurniture(payload);
            setShowAddModal(false);
            setAddForm({ code: '', name: '', category: '', dailyRate: '', condition: 'EXCELLENT', description: '', isRecliner: 'false', numberOfChairs: '', size: 'SINGLE' });
            fetchFurniture();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding furniture');
        }
    };

    const openEditModal = (f) => {
        setEditForm({
            id: f.id,
            name: f.name,
            dailyRate: f.dailyRate,
            condition: f.condition,
            available: f.available ? 'true' : 'false'
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        const payload = {
            name: editForm.name.trim(),
            dailyRate: parseFloat(editForm.dailyRate),
            condition: editForm.condition,
            available: editForm.available === 'true'
        };
        try {
            await updateFurniture(editForm.id, payload);
            setShowEditModal(false);
            fetchFurniture();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating');
        }
    };

    const handleDelete = async (f) => {
        if (!window.confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
        try {
            await deleteFurniture(f.id);
            fetchFurniture();
        } catch (err) {
            alert('Error deleting item');
        }
    };

    return (
        <Layout
            title="Furniture Inventory"
            subtitle="Manage your furniture catalog"
            actions={<button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Furniture</button>}
        >
            <div className="filter-bar">
                <button
                    className={`filter-btn ${!selectedCategory && !showAvailable ? 'active' : ''}`}
                    onClick={() => handleFilter('all')}
                >All</button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => handleFilter('category', cat)}
                    >{cat}</button>
                ))}
                <button
                    className={`filter-btn ${showAvailable ? 'active' : ''}`}
                    onClick={() => handleFilter('available')}
                >Available Only</button>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th><th>Code</th><th>Category</th>
                                <th>Daily Rate</th><th>Condition</th><th>Status</th>
                                <th>Details</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8"><div className="empty-state"><p>Loading...</p></div></td></tr>
                            ) : furniture.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        <div className="empty-state">
                                            <Couch size={48} style={{ margin: '0 auto', opacity: 0.4 }} />
                                            <p>No furniture found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                furniture.map(f => (
                                    <tr key={f.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="furniture-img">
                                                    {getCategoryIcon(f.category)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{f.name}</div>
                                                    <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{f.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><code style={{ color: 'var(--accent)', fontSize: '.82rem' }}>{f.code}</code></td>
                                        <td><span className="badge badge-info">{f.category}</span></td>
                                        <td style={{ fontWeight: 600 }}>
                                            ${Number(f.dailyRate).toFixed(2)}
                                            <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>/day</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${f.condition === 'EXCELLENT' ? 'badge-success' :
                                                f.condition === 'GOOD' ? 'badge-accent' :
                                                    f.condition === 'FAIR' ? 'badge-warning' : 'badge-danger'
                                                }`}>{f.condition}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${f.available ? 'badge-success' : 'badge-danger'}`}>
                                                {f.available ? 'Available' : 'Rented'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '.78rem', color: 'var(--muted)' }}>
                                            {f.isRecliner !== null && <span>{f.isRecliner ? 'Recliner' : 'Standard'}</span>}
                                            {f.numberOfChairs !== null && <span>{f.numberOfChairs} chairs</span>}
                                            {f.size !== null && <span>{f.size}</span>}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEditModal(f)}>
                                                    <Edit size={14} />
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
                    <div className="modal">
                        <h2 className="modal-title">Add New Furniture</h2>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Code *</label>
                                <input className="form-control" placeholder="e.g. SOFA003" value={addForm.code} onChange={e => setAddForm({ ...addForm, code: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select className="form-control" value={addForm.category} onChange={e => setAddForm({ ...addForm, category: e.target.value })}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Name *</label>
                            <input className="form-control" placeholder="e.g. Leather Recliner Sofa" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-control" placeholder="Brief description" value={addForm.description} onChange={e => setAddForm({ ...addForm, description: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Daily Rate ($) *</label>
                                <input className="form-control" type="number" step="0.01" min="0" placeholder="0.00" value={addForm.dailyRate} onChange={e => setAddForm({ ...addForm, dailyRate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Condition</label>
                                <select className="form-control" value={addForm.condition} onChange={e => setAddForm({ ...addForm, condition: e.target.value })}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {addForm.category === 'SOFA' && (
                            <div className="form-group">
                                <label className="form-label">Recliner?</label>
                                <select className="form-control" value={addForm.isRecliner} onChange={e => setAddForm({ ...addForm, isRecliner: e.target.value })}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        )}

                        {addForm.category === 'TABLE' && (
                            <div className="form-group">
                                <label className="form-label">Chairs Included</label>
                                <input className="form-control" type="number" min="0" placeholder="0" value={addForm.numberOfChairs} onChange={e => setAddForm({ ...addForm, numberOfChairs: e.target.value })} />
                            </div>
                        )}

                        {addForm.category === 'BED' && (
                            <div className="form-group">
                                <label className="form-label">Bed Size</label>
                                <select className="form-control" value={addForm.size} onChange={e => setAddForm({ ...addForm, size: e.target.value })}>
                                    {BED_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddSubmit}>Add Furniture</button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
                    <div className="modal">
                        <h2 className="modal-title">Edit Furniture</h2>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input className="form-control" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Daily Rate ($)</label>
                                <input className="form-control" type="number" step="0.01" value={editForm.dailyRate} onChange={e => setEditForm({ ...editForm, dailyRate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Condition</label>
                                <select className="form-control" value={editForm.condition} onChange={e => setEditForm({ ...editForm, condition: e.target.value })}>
                                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Available</label>
                            <select className="form-control" value={editForm.available} onChange={e => setEditForm({ ...editForm, available: e.target.value })}>
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSubmit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Furniture;
