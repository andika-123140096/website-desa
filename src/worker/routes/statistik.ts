import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { JWTPayload, Variables } from '../types';

const statistikRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

statistikRoutes.use('/*', authMiddleware);

statistikRoutes.get('/dusun/:id', async (c) => {
  try {
    const dusunId = c.req.param('id');

    const dusun = await c.env.DB.prepare(
      'SELECT * FROM dusun WHERE id = ?'
    ).bind(dusunId).first();

    if (!dusun) {
      return c.json({ error: 'Dusun tidak ditemukan' }, 404);
    }

    const totalPajakResult = await c.env.DB.prepare(
      'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_terhutang FROM surat_pbb WHERE id_dusun = ?'
    ).bind(dusunId).first();

    const pajakDibayarResult = await c.env.DB.prepare(
      'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_dibayar FROM surat_pbb WHERE id_dusun = ? AND (status_pembayaran = "bayar_sendiri_di_bank" OR status_pembayaran = "bayar_lewat_perangkat_desa")'
    ).bind(dusunId).first();

    const statusCount = await c.env.DB.prepare(
      'SELECT status_pembayaran, COUNT(*) as jumlah FROM surat_pbb WHERE id_dusun = ? GROUP BY status_pembayaran'
    ).bind(dusunId).all();

    const totalSurat = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ?'
    ).bind(dusunId).first();

    const statusPembayaran = statusCount.results;

    return c.json({
      dusun,
      total_pajak_terhutang: totalPajakResult?.total_pajak_terhutang || 0,
      total_pajak_dibayar: pajakDibayarResult?.total_pajak_dibayar || 0,
      total_surat: totalSurat?.total || 0,
      statusPembayaran
    });
  } catch {
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

statistikRoutes.get('/laporan', async (c) => {
  try {
    const user = c.get('user') as JWTPayload;

    if (user.roles !== 'superadmin') {
      return c.json({ error: 'Hanya superadmin yang dapat mengakses laporan' }, 403);
    }

    const dusunList = await c.env.DB.prepare(
      'SELECT d.id, d.nama_dusun, d.status_data_pbb, p.nama_lengkap as nama_kepala_dusun FROM dusun d LEFT JOIN pengguna p ON d.id_kepala_dusun = p.id'
    ).all();

    const statistikPerDusun = [];

    for (const dusun of dusunList.results) {
      const totalPajakResult = await c.env.DB.prepare(
        'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_terhutang FROM surat_pbb WHERE id_dusun = ?'
      ).bind(dusun.id).first();

      const pajakDibayarResult = await c.env.DB.prepare(
        'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_dibayar FROM surat_pbb WHERE id_dusun = ? AND (status_pembayaran = "bayar_sendiri_di_bank" OR status_pembayaran = "bayar_lewat_perangkat_desa")'
      ).bind(dusun.id).first();

      const totalSurat = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM surat_pbb WHERE id_dusun = ?'
      ).bind(dusun.id).first();

      statistikPerDusun.push({
        ...dusun,
        total_pajak_terhutang: totalPajakResult?.total_pajak_terhutang || 0,
        total_pajak_dibayar: pajakDibayarResult?.total_pajak_dibayar || 0,
        total_surat: totalSurat?.total || 0
      });
    }

    const totalKeseluruhan = await c.env.DB.prepare(
      'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_terhutang FROM surat_pbb'
    ).first();

    const totalDibayarKeseluruhan = await c.env.DB.prepare(
      'SELECT SUM(jumlah_pajak_terhutang) as total_pajak_dibayar FROM surat_pbb WHERE status_pembayaran = "bayar_sendiri_di_bank" OR status_pembayaran = "bayar_lewat_perangkat_desa"'
    ).first();

    return c.json({
      statistik_per_dusun: statistikPerDusun,
      total_pajak_terhutang_keseluruhan: totalKeseluruhan?.total_pajak_terhutang || 0,
      total_pajak_dibayar_keseluruhan: totalDibayarKeseluruhan?.total_pajak_dibayar || 0
    });
  } catch {
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

export default statistikRoutes;
