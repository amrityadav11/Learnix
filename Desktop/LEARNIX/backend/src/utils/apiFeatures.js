class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        const queryObj = { ...this.queryStr };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering: gte, gt, lte, lt
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    search(fields = ['title']) {
        if (this.queryStr.search) {
            const searchRegex = new RegExp(this.queryStr.search, 'i');
            const searchQuery = fields.map((field) => ({ [field]: searchRegex }));
            this.query = this.query.find({ $or: searchQuery });
        }
        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryStr.page) || 1;
        const limit = parseInt(this.queryStr.limit) || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        this.page = page;
        this.limit = limit;
        return this;
    }
}

module.exports = APIFeatures;
