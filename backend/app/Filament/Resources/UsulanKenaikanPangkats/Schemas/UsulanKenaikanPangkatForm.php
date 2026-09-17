<?php

namespace App\Filament\Resources\UsulanKenaikanPangkats\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UsulanKenaikanPangkatForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Informasi Pegawai')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)->schema([
                            TextInput::make('pegawai_id')
                                ->required()
                                ->numeric()
                                ->disabled(),
                            TextInput::make('nomor_usulan')
                                ->required()
                                ->disabled(),
                        ]),
                        \Filament\Schemas\Components\Grid::make(2)->schema([
                            TextInput::make('masa_kerja_tahun')
                                ->required()
                                ->numeric()
                                ->disabled(),
                            TextInput::make('masa_kerja_bulan')
                                ->required()
                                ->numeric()
                                ->disabled(),
                        ]),
                        \Filament\Schemas\Components\Grid::make(2)->schema([
                            \Filament\Forms\Components\DateTimePicker::make('tanggal_diajukan')
                                ->disabled(),
                            \Filament\Forms\Components\DateTimePicker::make('tanggal_diverifikasi')
                                ->disabled(),
                        ]),
                        \Filament\Schemas\Components\Grid::make(1)->schema([
                            TextInput::make('status_baru')
                                ->label('Kenaikan Pangkat Menjadi')
                                ->disabled(),
                        ]),
                    ]),

                \Filament\Schemas\Components\Section::make('Tinjauan')
                    ->schema([
                        Select::make('status')
                            ->options([
                                'diajukan' => 'Diajukan',
                                'ditinjau_admin' => 'Ditinjau Admin',
                                'revisi' => 'Revisi',
                                'diteruskan' => 'Diteruskan (ke Kepsek)',
                                'disetujui' => 'Disetujui',
                                'ditolak' => 'Ditolak',
                            ])
                            ->default('diajukan')
                            ->required()
                            ->rules([
                                fn ($record): \Closure => function (string $attribute, $value, \Closure $fail) use ($record) {
                                    if ($value === 'diteruskan' && $record) {
                                        $hasInvalidDocs = $record->dokumen()->where('status_validasi', '!=', 'valid')->exists();
                                        $hasDocs = $record->dokumen()->exists();
                                        if (!$hasDocs || $hasInvalidDocs) {
                                            $fail('Tidak dapat meneruskan usulan ke kepala sekolah karena dokumen usulan belum valid semuanya.');
                                        }
                                    }
                                },
                            ]),
                        Select::make('status_pengajuan')
                            ->options([
                                'belum diproses' => 'Belum Diproses',
                                'diproses' => 'Diproses',
                                'selesai' => 'Selesai',
                            ])
                            ->default('belum diproses')
                            ->required(),
                        \Filament\Forms\Components\Textarea::make('catatan_admin')
                            ->columnSpanFull(),
                        \Filament\Forms\Components\Textarea::make('catatan_kepsek')
                            ->columnSpanFull()
                            ->disabled(),
                    ]),
            ]);
    }
}
