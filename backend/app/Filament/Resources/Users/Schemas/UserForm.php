<?php

namespace App\Filament\Resources\Users\Schemas;

use App\Models\Role;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Akun')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nama Lengkap')
                            ->required()
                            ->maxLength(255),

                        TextInput::make('username')
                            ->label('Username')
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(100),

                        TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->required()
                            ->unique(ignoreRecord: true)
                            ->maxLength(255),

                        Select::make('role_id')
                            ->label('Role')
                            ->options(Role::pluck('display_name', 'id'))
                            ->searchable()
                            ->required()
                            ->native(false),

                        Select::make('status')
                            ->label('Status')
                            ->options([
                                'aktif' => 'Aktif',
                                'nonaktif' => 'Nonaktif',
                            ])
                            ->default('aktif')
                            ->required()
                            ->native(false),
                    ])
                    ->columns(2),

                Section::make('Password')
                    ->schema([
                        TextInput::make('password')
                            ->label('Password')
                            ->password()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrateStateUsing(fn ($state) => $state ? \Illuminate\Support\Facades\Hash::make($state) : null)
                            ->dehydrated(fn ($state) => filled($state))
                            ->maxLength(255)
                            ->helperText('Kosongkan jika tidak ingin mengubah password.'),

                        TextInput::make('password_confirmation')
                            ->label('Konfirmasi Password')
                            ->password()
                            ->same('password')
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(false),
                    ])
                    ->columns(2),
            ]);
    }
}
