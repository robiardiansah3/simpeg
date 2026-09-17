<?php

namespace App\Filament\Resources\LokasiSekolahs\Pages;

use App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource;
use App\Models\LokasiSekolah;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;

class PilihLokasiAktif extends Page
{
    protected static string $resource = LokasiSekolahResource::class;

    protected string $view = 'filament.pages.pilih-lokasi-aktif';

    protected static ?string $title = 'Pilih Lokasi Aktif';

    protected function getViewData(): array
    {
        return [
            'semuaLokasi' => LokasiSekolah::all(),
        ];
    }

    public function aktivasiLokasi(int $id): void
    {
        $lokasi = LokasiSekolah::find($id);
        if (!$lokasi) {
            Notification::make()
                ->title('Lokasi tidak ditemukan.')
                ->danger()
                ->send();
            return;
        }

        // Set aktif — model booted() otomatis nonaktifkan lokasi lainnya
        $lokasi->update(['status' => 'aktif']);

        Notification::make()
            ->title('Lokasi Aktif Diperbarui')
            ->body("\"{$lokasi->nama_lokasi}\" kini menjadi lokasi aktif.")
            ->success()
            ->send();

        $this->redirect(LokasiSekolahResource::getUrl('index'));
    }
}
