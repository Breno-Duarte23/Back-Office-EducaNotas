import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) console.debug('[Router] NavigationStart', ev);
      if (ev instanceof NavigationEnd) console.debug('[Router] NavigationEnd', ev);
      if (ev instanceof NavigationCancel) console.warn('[Router] NavigationCancel', ev);
      if (ev instanceof NavigationError) console.error('[Router] NavigationError', ev);
    });
  }
}