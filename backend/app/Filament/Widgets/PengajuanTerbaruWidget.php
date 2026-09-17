<?php

namespace App\Filament\Widgets;

use App\Models\UsulanCuti;
use App\Models\UsulanKenaikanPangkat;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class PengajuanTerbaruWidget extends BaseWidget
{
    protected static ?string $heading = 'Pengajuan Terbaru';

    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $cutiQuery = DB::table('usulan_cuti')
            ->select([
                'id',
                'pegawai_id',
                'nomor_usulan',
                'status',
                'tanggal_diajukan',
                DB::raw("'Cuti' as tipe"),
                'created_at',
            ]);

        $ukpQuery = DB::table('usulan_kenaikan_pangkat')
            ->select([
                'id',
                'pegawai_id',
                'nomor_usulan',
                'status',
                'tanggal_diajukan',
                DB::raw("'UKP' as tipe"),
                'created_at',
            ]);

        $unionQuery = $cutiQuery->union($ukpQuery);

        $query = UsulanCuti::query()
            ->fromSub($unionQuery, 'combined_usulan')
            ->select('*');

        $query->getModel()->setTable('combined_usulan');

        return $table
            ->query($query)
            ->columns([
                TextColumn::make('nomor_usulan')
                    ->label('No. Usulan')
                    ->searchable()
                    ->placeholder('—'),

                TextColumn::make('pegawai_id')
                    ->label('Nama Pegawai')
                    ->getStateUsing(fn ($record) => \App\Models\Pegawai::find($record->pegawai_id)?->nama_lengkap ?? '—')
                    ->placeholder('—'),

                TextColumn::make('tipe')
                    ->label('Jenis')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Cuti' => 'info',
                        'UKP'  => 'primary',
                        default => 'gray',
                    }),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'diajukan'       => 'warning',
                        'ditinjau_admin' => 'info',
                        'diteruskan'     => 'info',
                        'revisi'         => 'warning',
                        'disetujui'      => 'success',
                        'ditolak'        => 'danger',
                        default          => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'diajukan'       => 'Menunggu',
                        'ditinjau_admin' => 'Ditinjau',
                        'diteruskan'     => 'Diteruskan',
                        'revisi'         => 'Perlu Revisi',
                        'disetujui'      => 'Disetujui',
                        'ditolak'        => 'Ditolak',
                        default          => $state,
                    }),

                TextColumn::make('tanggal_diajukan')
                    ->label('Tgl Diajukan')
                    ->date('d M Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->paginated(false);
    }
}
