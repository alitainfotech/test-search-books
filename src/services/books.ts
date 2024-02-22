const uri = `/search.json`;

export interface BookSearchQuery {
    q: string;
    _spellcheck_count: number;
    limit: number;
    fields: Array<string>;
    mode: string;
}

export interface BookDetails {
    title: string;
    author_name: Array<string>;
    first_publish_year: number;
    isbn: Array<string>;
    number_of_pages_median: number;
    cover_i: number;
}

export interface BooksServerResponse {
    docs: Array<BookDetails>;
    numFound: number;
    numFoundExact: boolean;
    num_found: number;
    offset: any;
    q: string;
    start: number
}

function searchBooks(query: BookSearchQuery): Promise<Response> {
    const url = `${process.env.REACT_APP_BASE_URL}${uri}?q=${query.q}&_spellcheck_count=${query._spellcheck_count}&limit=${query.limit}&fields=${query.fields.join()}&mode=${query.mode}`;
    return fetch(url, {
        method: 'GET', headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
}

const BooksService = {
    searchBooks,
}

export default BooksService;