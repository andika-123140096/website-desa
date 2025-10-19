import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SuratPBB } from '../../types';

export function DashboardKetuaRT() {
  const { token } = useAuth();
  const [suratPBB, setSuratPBB] = useState<SuratPBB[]>([]);

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

  useEffect(() => {
    fetchSuratPBB();
  }, [fetchSuratPBB]);

  return (
    <div>
      <h2 className="mb-4">Dashboard Ketua RT</h2>

      <div className="card">
        <div className="card-body">
          <h5>Daftar Surat PBB</h5>
          <table className="table">
            <thead>
              <tr>
                <th>NOP</th>
                <th>Nama Wajib Pajak</th>
                <th>Alamat</th>
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
                  <td>{s.alamat_objek_pajak}</td>
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
  );
}
