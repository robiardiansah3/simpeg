<?php

namespace App\Filament\Pages\Auth;

use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use Illuminate\Validation\ValidationException;

class CustomLogin extends BaseLogin
{
    protected string $view = 'filament.pages.auth.login';

    protected static string $layout = 'filament.pages.auth.layout';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getLoginFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getRememberFormComponent(),
            ])
            ->statePath('data');
    }

    protected function getLoginFormComponent(): Component
    {
        return TextInput::make('login')
            ->label('Email atau Username')
            ->required()
            ->autocomplete()
            ->autofocus()
            ->extraInputAttributes(['tabindex' => 1]);
    }

    protected function getCredentialsFromFormData(array $data): array
    {
        $login_type = filter_var($data['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        return [
            $login_type => $data['login'],
            'password'  => $data['password'],
        ];
    }

    public function authenticate(): ?\Filament\Auth\Http\Responses\Contracts\LoginResponse
    {
        try {
            return parent::authenticate();
        } catch (ValidationException $e) {
            // Override pesan error default jika login gagal
            throw ValidationException::withMessages([
                'data.login' => __('Kredensial yang Anda masukkan salah.'),
            ]);
        }
    }
}
