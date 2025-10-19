import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Dusun, SuratPBB, Laporan } from '../../types';
import { formatRole, getRoleColor, formatStatusDataPBB, getStatusDataPBBColor } from '../../utils/formatters';

interface PerangkatDesa {
  id: string;
  nama_lengkap: string;
  username: string;
  id_dusun?: number;
  jabatan: 'kepala_dusun' | 'ketua_rt';
}

interface DusunDetail extends Dusun {
  token_kepala_dusun: string;
  token_ketua_rt: string;
}

export function DashboardSuperadminPBB() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('dusun');
  const [dusun, setDusun] = useState<Dusun[]>([]);
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([]);
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  
  const [showDusunModal, setShowDusunModal] = useState(false);
  const [showSuratModal, setShowSuratModal] = useState(false);
  const [showDusunDetailModal, setShowDusunDetailModal] = useState(false);
  const [showPerangkatDetailModal, setShowPerangkatDetailModal] = useState(false);
  
  const [dusunForm, setDusunForm] = useState({ nama_dusun: '' });
  const [suratForm, setSuratForm] = useState({
    dusun_id: '',
    nomor_objek_pajak: '',
    nama_wajib_pajak: '',
    alamat_objek_pajak: '',
    tahun_pajak: new Date().getFullYear().toString(),
    jumlah_pajak_terhutang: '',
    status_pembayaran: 'belum_bayar'
  });
  
  const [selectedDusun, setSelectedDusun] = useState<DusunDetail | null>(null);
  const [perangkatDesa, setPerangkatDesa] = useState<PerangkatDesa[]>([]);
  const [selectedPerangkat, setSelectedPerangkat] = useState<PerangkatDesa | null>(null);
  const [perangkatForm, setPerangkatForm] = useState({
    nama_lengkap: '',
    username: '',
    password: '',
    id_dusun: '',
    jabatan: ''
  });

  const fetchDusun = useCallback(async () => {
    try {
      const response = await fetch('/api/dusun', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) setDusun(result);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchSuratPBB = useCallback(async () => {
    try {
      const response = await fetch('/api/surat-pbb', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) setSuratPBB(result);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchLaporan = useCallback(async () => {
    try {
      const response = await fetch('/api/statistik/laporan', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) setLaporan(result);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'dusun') fetchDusun();
    if (activeTab === 'surat') fetchSuratPBB();
    if (activeTab === 'laporan') fetchLaporan();
  }, [activeTab, fetchDusun, fetchSuratPBB, fetchLaporan]);



  const updateStatusDataPBB = async (id: number, status: string) => {
    try {
      await fetch(`/api/dusun/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status_data_pbb: status as 'belum_lengkap' | 'sudah_lengkap' })
      });
      if (selectedDusun && selectedDusun.id === id) {
        setSelectedDusun({ ...selectedDusun, status_data_pbb: status as 'belum_lengkap' | 'sudah_lengkap' });
      }
      fetchDusun();
    } catch (err) {
      console.error(err);
    }
  };

  const openDusunDetail = async (id: number) => {
    try {
      const dusunResponse = await fetch(`/api/dusun/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dusunData = await dusunResponse.json();

      const tokensResponse = await fetch(`/api/dusun/${id}/tokens`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tokensData = await tokensResponse.json();

      setSelectedDusun({
        ...dusunData,
        token_kepala_dusun: tokensData.tokenKepalaDusun,
        token_ketua_rt: tokensData.tokenKetuaRT
      });

      const perangkatResponse = await fetch(`/api/perangkat-desa?dusun_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const perangkatData = await perangkatResponse.json();
      setPerangkatDesa(perangkatData);

      setShowDusunDetailModal(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil detail dusun');
    }
  };

  const openPerangkatDetail = (perangkat: PerangkatDesa) => {
    setSelectedPerangkat(perangkat);
    setPerangkatForm({
      nama_lengkap: perangkat.nama_lengkap,
      username: perangkat.username,
      password: '',
      id_dusun: perangkat.id_dusun?.toString() || '',
      jabatan: perangkat.jabatan
    });
    setShowPerangkatDetailModal(true);
  };

  const handleUpdatePerangkat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData: Partial<PerangkatDesa & { password: string }> = {
        nama_lengkap: perangkatForm.nama_lengkap,
        username: perangkatForm.username,
        id_dusun: perangkatForm.id_dusun ? Number(perangkatForm.id_dusun) : undefined,
        jabatan: perangkatForm.jabatan as 'kepala_dusun' | 'ketua_rt'
      };
      
      if (perangkatForm.password) {
        updateData.password = perangkatForm.password;
      }

      if (!selectedPerangkat) return;
      const response = await fetch(`/api/perangkat-desa/${selectedPerangkat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setShowPerangkatDetailModal(false);
        alert('Data perangkat desa berhasil diperbarui!');
        if (selectedDusun) {
          openDusunDetail(selectedDusun.id);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal memperbarui data perangkat desa');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const handleCreateDusun = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dusun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dusunForm)
      });
      if (response.ok) {
        setShowDusunModal(false);
        setDusunForm({ nama_dusun: '' });
        fetchDusun();
        const result = await response.json();
        alert(`Dusun berhasil ditambahkan!\n\nToken Kepala Dusun: ${result.tokenKepalaDusun}\nToken Ketua RT: ${result.tokenKetuaRT}\n\nSimpan token ini untuk registrasi perangkat desa!`);
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menambahkan dusun');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  const handleCreateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/surat-pbb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...suratForm,
          dusun_id: Number(suratForm.dusun_id),
          jumlah_pajak_terhutang: Number(suratForm.jumlah_pajak_terhutang)
        })
      });
      if (response.ok) {
        setShowSuratModal(false);
        setSuratForm({
          dusun_id: '',
          nomor_objek_pajak: '',
          nama_wajib_pajak: '',
          alamat_objek_pajak: '',
          tahun_pajak: new Date().getFullYear().toString(),
          jumlah_pajak_terhutang: '',
          status_pembayaran: 'belum_bayar'
        });
        fetchSuratPBB();
        alert('Surat PBB berhasil ditambahkan!');
      } else {
        const error = await response.json();
        alert(error.message || 'Gagal menambahkan surat PBB');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan');
    }
  };

  return (
    <div className="container-wide">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Pengelolaan PBB</h2>
          <p className="text-muted mb-0 small">Superadmin</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3" style={{ backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid #dee2e6' }}>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dusun' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dusun')}
            style={{ border: 'none', fontSize: '0.9rem' }}
          >
            <i className="bi bi-building me-2"></i>Dusun
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'surat' ? 'active' : ''}`} 
            onClick={() => setActiveTab('surat')}
            style={{ border: 'none', fontSize: '0.9rem' }}
          >
            <i className="bi bi-file-text me-2"></i>Surat PBB
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'laporan' ? 'active' : ''}`} 
            onClick={() => setActiveTab('laporan')}
            style={{ border: 'none', fontSize: '0.9rem' }}
          >
            <i className="bi bi-bar-chart me-2"></i>Laporan
          </button>
        </li>
      </ul>

      {activeTab === 'dusun' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Daftar Dusun</h6>
            <button className="btn btn-sm btn-primary" onClick={() => setShowDusunModal(true)}>
              <i className="bi bi-plus-circle me-1"></i>Tambah Dusun
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Nama Dusun</th>
                  <th>Kepala Dusun</th>
                  <th>Status Data</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dusun.map((d) => (
                  <tr key={d.id}>
                    <td>{d.nama_dusun}</td>
                    <td>{d.nama_kepala_dusun || 'Belum ada'}</td>
                    <td>
                      <span className={`badge bg-${getStatusDataPBBColor(d.status_data_pbb)}`}>
                        {formatStatusDataPBB(d.status_data_pbb)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => openDusunDetail(d.id)}
                      >
                        <i className="bi bi-eye me-1"></i>Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'surat' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Daftar Surat PBB</h6>
            <button className="btn btn-sm btn-primary" onClick={() => setShowSuratModal(true)}>
              <i className="bi bi-plus-circle me-1"></i>Tambah Surat
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>NOP</th>
                  <th>Nama Wajib Pajak</th>
                  <th>Dusun</th>
                  <th>Tahun</th>
                  <th>Jumlah Pajak</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {suratPBB.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nomor_objek_pajak}</td>
                    <td>{s.nama_wajib_pajak}</td>
                    <td>{s.nama_dusun}</td>
                    <td>{s.tahun_pajak}</td>
                    <td>Rp {Number(s.jumlah_pajak_terhutang).toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`badge bg-${s.status_pembayaran.includes('bayar') ? 'success' : 'warning'}`}>
                        {s.status_pembayaran}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'laporan' && laporan && (
        <div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <div className="card border-primary">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Total Pajak Terhutang</div>
                      <div className="h4 mb-0 text-primary">
                        Rp {Number(laporan.total_pajak_terhutang_keseluruhan || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <i className="bi bi-wallet2 text-primary" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-success">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div className="text-muted small">Total Pajak Dibayar</div>
                      <div className="h4 mb-0 text-success">
                        Rp {Number(laporan.total_pajak_dibayar_keseluruhan || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <i className="bi bi-check-circle text-success" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Statistik Per Dusun</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-container">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Dusun</th>
                    <th>Status Data</th>
                    <th>Total Surat</th>
                    <th>Pajak Terhutang</th>
                    <th>Pajak Dibayar</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.statistik_per_dusun.map((stat) => (
                    <tr key={stat.id}>
                      <td>{stat.nama_dusun}</td>
                      <td>
                        <span className={`badge bg-${stat.status_data_pbb === 'sudah_lengkap' ? 'success' : 'warning'}`}>
                          {stat.status_data_pbb}
                        </span>
                      </td>
                      <td>{stat.total_surat}</td>
                      <td>Rp {Number(stat.total_pajak_terhutang || 0).toLocaleString('id-ID')}</td>
                      <td>Rp {Number(stat.total_pajak_dibayar || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDusunModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Tambah Dusun Baru</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDusunModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateDusun}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nama Dusun <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={dusunForm.nama_dusun}
                      onChange={(e) => setDusunForm({ ...dusunForm, nama_dusun: e.target.value })}
                      required
                      placeholder="Contoh: Dusun Mawar"
                    />
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      2 token registrasi akan dibuat otomatis (1 untuk Kepala Dusun, 1 untuk Ketua RT)
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDusunModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-1"></i>Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSuratModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Tambah Surat PBB Baru</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowSuratModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateSurat}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Dusun <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={suratForm.dusun_id}
                        onChange={(e) => setSuratForm({ ...suratForm, dusun_id: e.target.value })}
                        required
                      >
                        <option value="">Pilih Dusun</option>
                        {dusun.map((d) => (
                          <option key={d.id} value={d.id}>{d.nama_dusun}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nomor Objek Pajak (NOP) <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={suratForm.nomor_objek_pajak}
                        onChange={(e) => setSuratForm({ ...suratForm, nomor_objek_pajak: e.target.value })}
                        required
                        placeholder="Contoh: 35.01.020.002.012.0001.0"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nama Wajib Pajak <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={suratForm.nama_wajib_pajak}
                        onChange={(e) => setSuratForm({ ...suratForm, nama_wajib_pajak: e.target.value })}
                        required
                        placeholder="Nama lengkap"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tahun Pajak <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        value={suratForm.tahun_pajak}
                        onChange={(e) => setSuratForm({ ...suratForm, tahun_pajak: e.target.value })}
                        required
                        min="2020"
                        max="2099"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Alamat Objek Pajak <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control"
                        value={suratForm.alamat_objek_pajak}
                        onChange={(e) => setSuratForm({ ...suratForm, alamat_objek_pajak: e.target.value })}
                        required
                        rows={2}
                        placeholder="Alamat lengkap objek pajak"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Jumlah Pajak Terhutang (Rp) <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        className="form-control"
                        value={suratForm.jumlah_pajak_terhutang}
                        onChange={(e) => setSuratForm({ ...suratForm, jumlah_pajak_terhutang: e.target.value })}
                        required
                        min="0"
                        placeholder="Contoh: 500000"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status Pembayaran <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={suratForm.status_pembayaran}
                        onChange={(e) => setSuratForm({ ...suratForm, status_pembayaran: e.target.value })}
                        required
                      >
                        <option value="belum_bayar">Belum Bayar</option>
                        <option value="sudah_bayar_sebagian">Sudah Bayar Sebagian</option>
                        <option value="sudah_bayar_lunas">Sudah Bayar Lunas</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowSuratModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-1"></i>Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDusunDetailModal && selectedDusun && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div>
                  <h5 className="modal-title mb-1">Detail Dusun: {selectedDusun.nama_dusun}</h5>
                  <small className="opacity-75">Manajemen data perangkat desa dan status kelengkapan data</small>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDusunDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0"><i className="bi bi-info-circle me-2"></i>Informasi Dusun</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Nama Dusun</label>
                        <div className="fw-semibold">{selectedDusun.nama_dusun}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Kepala Dusun</label>
                        <div className="fw-semibold">{selectedDusun.nama_kepala_dusun || 'Belum ada'}</div>
                      </div>
                      <div className="col-md-4">
                        <label className="form-label text-muted small">Status Data PBB</label>
                        <div>
                          <select 
                            className="form-select form-select-sm"
                            value={selectedDusun.status_data_pbb}
                            onChange={(e) => updateStatusDataPBB(selectedDusun.id, e.target.value)}
                            style={{ maxWidth: '200px' }}
                          >
                            <option value="belum_lengkap">Belum Lengkap</option>
                            <option value="sudah_lengkap">Sudah Lengkap</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header bg-warning bg-opacity-10">
                    <h6 className="mb-0 text-warning"><i className="bi bi-key me-2"></i>Token Registrasi</h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Token Kepala Dusun</label>
                        <div className="input-group input-group-sm">
                          <input 
                            type="text" 
                            className="form-control font-monospace bg-light" 
                            value={selectedDusun.token_kepala_dusun || 'N/A'} 
                            readOnly 
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedDusun.token_kepala_dusun);
                              alert('Token berhasil disalin!');
                            }}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </div>
                        <small className="text-muted">Gunakan token ini untuk registrasi Kepala Dusun</small>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Token Ketua RT</label>
                        <div className="input-group input-group-sm">
                          <input 
                            type="text" 
                            className="form-control font-monospace bg-light" 
                            value={selectedDusun.token_ketua_rt || 'N/A'} 
                            readOnly 
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedDusun.token_ketua_rt);
                              alert('Token berhasil disalin!');
                            }}
                          >
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </div>
                        <small className="text-muted">Gunakan token ini untuk registrasi Ketua RT</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0"><i className="bi bi-people me-2"></i>Daftar Perangkat Desa</h6>
                  </div>
                  <div className="card-body p-0">
                    {perangkatDesa.length === 0 ? (
                      <div className="p-4 text-center text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                        <p className="mt-2 mb-0">Belum ada perangkat desa yang terdaftar</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Nama Lengkap</th>
                              <th>Username</th>
                              <th>Jabatan</th>
                              <th>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {perangkatDesa.map((p) => (
                              <tr key={p.id}>
                                <td>{p.nama_lengkap}</td>
                                <td>{p.username}</td>
                                <td>
                                  <span className={`badge bg-${getRoleColor(p.jabatan)}`}>
                                    {formatRole(p.jabatan)}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => openPerangkatDetail(p)}
                                  >
                                    <i className="bi bi-eye me-1"></i>Lihat Detail
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDusunDetailModal(false)}
                >
                  <i className="bi bi-arrow-left me-1"></i>Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPerangkatDetailModal && selectedPerangkat && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <div>
                  <h5 className="modal-title mb-1">Edit Perangkat Desa</h5>
                  <small className="opacity-75">{selectedPerangkat.nama_lengkap}</small>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowPerangkatDetailModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdatePerangkat}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nama Lengkap <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={perangkatForm.nama_lengkap}
                        onChange={(e) => setPerangkatForm({ ...perangkatForm, nama_lengkap: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Username <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={perangkatForm.username}
                        onChange={(e) => setPerangkatForm({ ...perangkatForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Password Baru</label>
                      <input
                        type="password"
                        className="form-control"
                        value={perangkatForm.password}
                        onChange={(e) => setPerangkatForm({ ...perangkatForm, password: e.target.value })}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Kosongkan jika tidak ingin mengubah password
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Jabatan <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={perangkatForm.jabatan}
                        onChange={(e) => setPerangkatForm({ ...perangkatForm, jabatan: e.target.value })}
                        required
                      >
                        <option value="kepala_dusun">Kepala Dusun</option>
                        <option value="ketua_rt">Ketua RT</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Dusun <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={perangkatForm.id_dusun}
                        onChange={(e) => setPerangkatForm({ ...perangkatForm, id_dusun: e.target.value })}
                        required
                      >
                        <option value="">Pilih Dusun</option>
                        {dusun.map((d) => (
                          <option key={d.id} value={d.id}>{d.nama_dusun}</option>
                        ))}
                      </select>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Pilih dusun yang sesuai dengan wilayah tugas perangkat desa
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPerangkatDetailModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-1"></i>Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
