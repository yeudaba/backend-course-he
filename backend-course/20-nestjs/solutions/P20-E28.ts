// P20-E28: סיכום לקוח — שני repositories במקביל
import { Controller, Get, Inject, Injectable, Module, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";

export interface Customer {
  id: number;
  fullName: string;
}

export interface Order {
  id: number;
  customerId: number;
  total: number;
  status: "paid" | "cancelled";
}

export interface CustomersRepository {
  findById(id: number): Promise<Customer | null>;
}

export interface OrdersRepository {
  findByCustomer(customerId: number): Promise<Order[]>;
}

export const CUSTOMERS_REPOSITORY = "CUSTOMERS_REPOSITORY";
export const ORDERS_REPOSITORY = "ORDERS_REPOSITORY";

export class InMemoryCustomersRepository implements CustomersRepository {
  private readonly customers: Customer[] = [{ id: 1, fullName: "Dana Levi" }];

  async findById(id: number) {
    return this.customers.find((c) => c.id === id) ?? null;
  }
}

export class InMemoryOrdersRepository implements OrdersRepository {
  private readonly orders: Order[] = [
    { id: 1, customerId: 1, total: 120.5, status: "paid" },
    { id: 2, customerId: 1, total: 80, status: "cancelled" },
  ];

  async findByCustomer(customerId: number) {
    return this.orders.filter((o) => o.customerId === customerId);
  }
}

@Injectable()
export class SummaryService {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY) private readonly customers: CustomersRepository,
    @Inject(ORDERS_REPOSITORY) private readonly orders: OrdersRepository,
  ) {}

  async summary(customerId: number) {
    const [customer, orders] = await Promise.all([this.customers.findById(customerId), this.orders.findByCustomer(customerId)]);
    if (!customer) throw new NotFoundException(`לקוח ${customerId} לא נמצא`);
    const paid = orders.filter((o) => o.status === "paid");
    const agorot = paid.reduce((sum, o) => sum + Math.round(o.total * 100), 0);
    return { customer, orders: paid.length, total: agorot / 100 };
  }
}

@Controller("customers")
export class SummaryController {
  constructor(private readonly service: SummaryService) {}

  @Get(":id/summary")
  summary(@Param("id", ParseIntPipe) id: number) {
    return this.service.summary(id);
  }
}

@Module({
  controllers: [SummaryController],
  providers: [
    SummaryService,
    { provide: CUSTOMERS_REPOSITORY, useClass: InMemoryCustomersRepository },
    { provide: ORDERS_REPOSITORY, useClass: InMemoryOrdersRepository },
  ],
})
export class SummaryModule {}
