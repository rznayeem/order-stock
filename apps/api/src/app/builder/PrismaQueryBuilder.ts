type QueryParams = Record<string, unknown>;

interface PrismaQueryOptions {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  select?: any;
}

class PrismaQueryBuilder {
  private query: QueryParams;
  private options: PrismaQueryOptions = {};

  constructor(query: QueryParams) {
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.options.where = {
        OR: searchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      };
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ["searchTerm", "sort", "limit", "page", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    if (!this.options.where) this.options.where = {};
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined) this.options.where[key] = value;
    });
    return this;
  }

  sort() {
    const sort = (this.query.sort as string) || "createdAt";
    const orderBy = sort.startsWith("-") ? { [sort.substring(1)]: "desc" } : { [sort]: "asc" };
    this.options.orderBy = orderBy;
    return this;
  }

  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;
    this.options.skip = skip;
    this.options.take = limit;
    return this;
  }

  fields() {
    const fields = this.query.fields as string;
    if (fields) {
      this.options.select = fields.split(",").reduce(
        (acc, field) => { acc[field] = true; return acc; },
        {} as Record<string, boolean>
      );
    }
    return this;
  }

  build() {
    return this.options;
  }

  async countTotal(prismaModel: any) {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const total = await prismaModel.count({ where: this.options.where });
    return { page, limit, total, totalPage: Math.ceil(total / limit) };
  }
}

export default PrismaQueryBuilder;
