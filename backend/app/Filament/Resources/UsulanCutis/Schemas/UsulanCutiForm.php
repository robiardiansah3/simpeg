<?php

namespace App\Filament\Resources\UsulanCutis\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Schema;

class UsulanCutiForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                \Filament\Schemas\Components\Section::make('Informasi Cuti')
                    ->description('Detail usulan cuti pegawai.')
                    ->schema([
                        \Filament\Schemas\Components\Grid::make(2)->schema([
                            Select::make('pegawai_id')
                                ->relationship('pegawai', 'nama_lengkap')
                                ->required()
                                ->disabled(),
                            Select::make('jenis_cuti')
                                ->options([
                                    'Cuti Tahunan' => 'Cuti Tahunan',
                                    'Cuti Sakit' => 'Cuti Sakit',
                                    'Cuti Melahirkan' => 'Cuti Melahirkan',
                                    'Cuti Alasan Penting' => 'Cuti Alasan Penting',
                                    'Cuti lainnya' => 'Cuti lainnya',
                                ])
                                ->disabled(),
                        ]),
                        \Filament\Schemas\Components\Grid::make(2)->schema([
                            DatePicker::make('tanggal_mulai')->disabled(),
                            DatePicker::make('tanggal_selesai')->disabled(),
                        ]),
                        Textarea::make('alasan')->columnSpanFull()->disabled(),
                    ]),

                \Filament\Schemas\Components\Section::make('Tinjauan Admin')
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
                            ->required(),
                        Textarea::make('catatan_admin')
                            ->label('Catatan Admin')
                            ->columnSpanFull(),
                        Textarea::make('catatan_kepsek')
                            ->label('Catatan Kepsek')
                            ->columnSpanFull()
                            ->disabled(),
                    ]),

                \Filament\Schemas\Components\Section::make('Lampiran Dokumen')
                    ->description('Dokumen pendukung yang diunggah oleh pegawai (jika ada).')
                    ->schema([
                        FileUpload::make('lampiran')
                            ->label('File Lampiran')
                            ->disk('public')
                            ->directory('lampiran_cuti')
                            ->acceptedFileTypes(['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'])
                            ->maxSize(5120)
                            ->downloadable()
                            ->openable()
                            ->columnSpanFull()
                            ->disabled(),
                    ]),
            ]);
    }
}
