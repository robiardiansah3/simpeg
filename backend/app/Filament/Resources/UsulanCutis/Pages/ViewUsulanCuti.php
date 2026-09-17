<?php

namespace App\Filament\Resources\UsulanCutis\Pages;

use App\Filament\Resources\UsulanCutis\UsulanCutiResource;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewUsulanCuti extends ViewRecord
{
    protected static string $resource = UsulanCutiResource::class;

    protected string $view = 'filament.pages.view-usulan-cuti';

    protected function getHeaderActions(): array
    {
        return [
            Action::make('setuju')
                ->label('Setuju')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Setujui Usulan Cuti')
                ->modalDescription('Apakah Anda yakin ingin menyetujui usulan cuti ini?')
                ->action(function () {
                    $this->record->update([
                        'status' => 'disetujui',
                        'tanggal_diverifikasi' => now(),
                    ]);

                    Notification::make()
                        ->title('Usulan cuti berhasil disetujui')
                        ->success()
                        ->send();
                })
                ->visible(fn () => in_array($this->record->status, ['diajukan', 'ditinjau_admin', 'revisi', 'diteruskan'])),

            Action::make('revisi')
                ->label('Kirim ke Revisi')
                ->color('warning')
                ->requiresConfirmation()
                ->modalHeading('Kirim Usulan Cuti untuk Revisi')
                ->modalDescription('Apakah Anda yakin ingin meminta revisi untuk usulan cuti ini?')
                ->form([
                    \Filament\Forms\Components\Textarea::make('catatan_admin')
                        ->label('Catatan Revisi')
                        ->required()
                        ->placeholder('Masukkan alasan atau perbaikan yang dibutuhkan...'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status' => 'revisi',
                        'catatan_admin' => $data['catatan_admin'],
                        'tanggal_diverifikasi' => now(),
                    ]);

                    Notification::make()
                        ->title('Usulan cuti dikirim untuk revisi')
                        ->warning()
                        ->send();
                })
                ->visible(fn () => in_array($this->record->status, ['diajukan', 'ditinjau_admin', 'diteruskan'])),

            Action::make('tolak')
                ->label('Tolak')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Tolak Usulan Cuti')
                ->modalDescription('Apakah Anda yakin ingin menolak usulan cuti ini?')
                ->form([
                    \Filament\Forms\Components\Textarea::make('catatan_admin')
                        ->label('Alasan Penolakan')
                        ->required()
                        ->placeholder('Masukkan alasan penolakan...'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status' => 'ditolak',
                        'catatan_admin' => $data['catatan_admin'],
                        'tanggal_diverifikasi' => now(),
                    ]);

                    Notification::make()
                        ->title('Usulan cuti ditolak')
                        ->danger()
                        ->send();
                })
                ->visible(fn () => in_array($this->record->status, ['diajukan', 'ditinjau_admin', 'revisi', 'diteruskan'])),
        ];
    }
}
