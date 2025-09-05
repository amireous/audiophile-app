import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderService, Order } from 'src/app/services/order.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  subscriptions: Subscription[] = [];

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const subscription = this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
              error: (error) => {
          this.snackBar.open('Error loading orders', 'Close', {
            duration: 3000,
          });
          this.isLoading = false;
        }
    });

    this.subscriptions.push(subscription);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return '#FFA500'; // Orange
      case 'shipped':
        return '#007BFF'; // Blue
      case 'delivered':
        return '#28A745'; // Green
      case 'cancelled':
        return '#DC3545'; // Red
      default:
        return '#6C757D'; // Gray
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


