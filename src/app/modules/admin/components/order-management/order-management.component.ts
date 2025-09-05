import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, Order } from '../../../../services/admin.service';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading orders', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  updateOrderStatus(order: Order, status: Order['status']): void {
    this.adminService.updateOrderStatus(order.id!, status).subscribe({
      next: (updatedOrder) => {
        this.snackBar.open(`Order status updated to ${status}`, 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        this.snackBar.open('Error updating order status', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'warn';
      case 'shipped': return 'primary';
      case 'delivered': return 'accent';
      case 'cancelled': return 'warn';
      default: return 'primary';
    }
  }
}
