import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "../auth/auth.decorators";
import { EmailsService } from "./emails.service";

@ApiTags("emails")
@ApiBearerAuth()
@Controller("emails")
export class EmailsController {
  constructor(private readonly emails: EmailsService) {}

  // "תיבת הדואר" המדומה — רק למנהל
  @Get()
  @Roles("admin")
  list() {
    return this.emails.list();
  }
}
