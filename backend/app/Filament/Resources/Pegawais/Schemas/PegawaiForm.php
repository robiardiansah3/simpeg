<?php

namespace App\Filament\Resources\Pegawais\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class PegawaiForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->label('User Akun')
                    ->required()
                    ->searchable()
                    ->preload(),

                TextInput::make('nbm')
                    ->label('NBM')
                    ->default(null),

                TextInput::make('nama_lengkap')
                    ->label('Nama Lengkap')
                    ->required(),

                Select::make('jenis_kelamin')
                    ->label('Jenis Kelamin')
                    ->options(['Laki-laki' => 'Laki-laki', 'Perempuan' => 'Perempuan'])
                    ->required(),

                TextInput::make('tempat_lahir')
                    ->label('Tempat Lahir')
                    ->required(),

                DatePicker::make('tanggal_lahir')
                    ->label('Tanggal Lahir')
                    ->required(),

                TextInput::make('agama')
                    ->label('Agama')
                    ->required(),

                TextInput::make('pendidikan_terakhir')
                    ->label('Pendidikan Terakhir')
                    ->required(),

                TextInput::make('jurusan')
                    ->label('Jurusan')
                    ->required(),

                TextInput::make('jabatan')
                    ->label('Jabatan')
                    ->required(),

                Select::make('status_kepegawaian')
                    ->label('Status Kepegawaian')
                    ->options([
                        'Kontrak' => 'Kontrak',
                        'Pegawai Tidak Tetap Persyarikatan (PTTP)' => 'Pegawai Tidak Tetap Persyarikatan (PTTP)',
                        'Pegawai Tetap Persyarikatan (PTP)' => 'Pegawai Tetap Persyarikatan (PTP)',
                        'Guru Tidak Tetap Persyarikatan (GTTP)' => 'Guru Tidak Tetap Persyarikatan (GTTP)',
                        'Guru Tetap Persyarikatan (GTP)' => 'Guru Tetap Persyarikatan (GTP)',
                    ])
                    ->required(),

                Select::make('status')
                    ->label('Jenis Pegawai')
                    ->options([
                        'guru' => 'Guru',
                        'pegawai(staf)' => 'Pegawai (Staf)',
                    ])
                    ->required(),

                Textarea::make('alamat')
                    ->label('Alamat Lengkap')
                    ->required()
                    ->columnSpanFull(),

                TextInput::make('nomor_telepon')
                    ->label('Nomor Telepon')
                    ->tel()
                    ->required(),

                \Filament\Forms\Components\FileUpload::make('foto')
                    ->label('Foto Profile')
                    ->image()
                    ->disk('public')
                    ->directory('foto_pegawai')
                    ->maxSize(2048)
                    ->default(null),
            ]);
    }
}
