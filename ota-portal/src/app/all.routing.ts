import { Routes, RouterModule } from '@angular/router';
import { ManifestComponent } from "./components/manifest/manifest.component";
import { PageNotFoundComponent } from "./components/page-not-found/page-not-found.component";
import { FirmwaresComponent } from "./components/firmwares/firmwares.component";

export const AllRoutes: Routes = [
  { path: 'manifest', component: ManifestComponent },
  { path: 'firmwares',      component: FirmwaresComponent },
  { path: 'firmwares/:id',      component: ManifestComponent },
  { path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

//export const AllRoutes = RouterModule.forChild(routes);
