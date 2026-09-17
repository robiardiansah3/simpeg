<?php

namespace App\Filament\Resources\LokasiSekolahs\Pages;

use App\Filament\Resources\LokasiSekolahs\LokasiSekolahResource;
use App\Models\LokasiSekolah;
use Filament\Actions\CreateAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListLokasiSekolahs extends ListRecords
{
    protected static string $resource = LokasiSekolahResource::class;

    protected string $view = 'filament.pages.lokasi-sekolah-list';

    protected function getViewData(): array
    {
        return [
            'lokasi'      => LokasiSekolah::where('status', 'aktif')->first(),
            'semuaLokasi' => LokasiSekolah::orderBy('status')->orderBy('nama_lokasi')->get(),
        ];
    }

    protected function getHeaderActions(): array
    {
        return [];
    }

    public function hapusLokasi(int $id): void
    {
        $lokasi = LokasiSekolah::find($id);
        if ($lokasi) {
            $lokasi->delete();
            Notification::make()
                ->title('Lokasi Dihapus')
                ->body('Lokasi sekolah berhasil dihapus.')
                ->success()
                ->send();
        }
    }

    public function aktivasiLokasi(int $id): void
    {
        $lokasi = LokasiSekolah::find($id);
        if (! $lokasi) {
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

        $this->redirect(static::getUrl());
    }
}
