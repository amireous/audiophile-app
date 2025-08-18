// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/authenticate/authenticate.module').then(
        (m) => m.AuthenticateModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
