import { Layout, List, Radio, RadioChangeEvent, Space, theme } from 'antd';
import './App.css';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import Search from 'antd/es/input/Search';
import React, { useEffect, useState } from 'react';
import BooksService, { BookDetails, BookSearchQuery, BooksServerResponse } from './services/books';
import useDebouncedValue from './hooks/debounceHander';

function App() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [books, setBooks] = useState<Array<BookDetails>>([]);
  const [defaultData, setDefaultData] = useState<Array<BookDetails>>([]);
  const [perPage] = useState<number>(50);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 1000);
  const [sortOrder, setSortOrder] = useState<string>('default');

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>): void {
    const { target: { value } } = event;
    setSearchTerm(value);
    if (!value.trim()) {
      setBooks([]);
    }
  }

  function handleApiCall(searchTerm: string): void {
    setLoading(true);
    const searchQuery: BookSearchQuery = {
      q: searchTerm,
      _spellcheck_count: 0,
      limit: perPage,
      mode: 'everything',
      fields: ["title", "author_name", "first_publish_year", "isbn", "lending_identifier_s", "number_of_pages_median", "cover_i"]
    }
    BooksService.searchBooks(searchQuery)
      .then((res: Response) => {
        return res.json()
      }).then((value: BooksServerResponse) => {
        const books: Array<BookDetails> = value.docs;
        setTotalRecords(value.numFound)
        setBooks(books);
      })
      .catch((error) => {
        console.log('Error => ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
      handleApiCall(debouncedSearchTerm.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const OnlyText = ({ text }: { text: string }) => (
    <Space>
      {text}
    </Space>
  );

  function renderBookAuthors(names: Array<string>) {
    if (names && names.length > 0) {
      return names.map((value: string, index: number) => <OnlyText text={value} key={index} />)
    }
    return undefined
  }

  function handleSortChange(event: RadioChangeEvent): void {
    const { target: { value } } = event;
    setSortOrder(value);
    sortData(value);
  }

  function sortData(sortType: string): void {
    if (sortType === 'default') {
      setBooks([...defaultData]);
      setDefaultData([]);
    } else {
      setDefaultData([...books]);
      const sortedBooks: Array<BookDetails> = books.sort((aBook: BookDetails, bBook: BookDetails) => aBook.first_publish_year - bBook.first_publish_year);
      setBooks(sortedBooks);
    }
  }

  return (
    <div className="app-wrapper">
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="logo">Books</div>
          <div className="elements-end">
            <Search value={searchTerm} onChange={handleSearch} placeholder="Enter minimum 3 characters to start search. It will start search when you stop typing" loading={loading} className='search' />
            <Radio.Group onChange={handleSortChange} value={sortOrder} disabled={books.length <= 0 || loading}>
              <Radio.Button value="default">Default</Radio.Button>
              <Radio.Button value="publish-asd">Asc By Publish Year</Radio.Button>
            </Radio.Group>
          </div>
        </Header>
        <Content style={{ padding: '0 48px' }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
          >
            {loading
              ?
              <b>Please wait!!! We are searching for books...</b>
              :
              <>
                {books && books.length > 0 &&
                  <>
                    <List
                      itemLayout="vertical"
                      size="small"
                      dataSource={books}
                      footer={
                        <div>
                          <b>Only {perPage} records from {totalRecords}</b>
                        </div>
                      }
                      renderItem={(book: BookDetails) => (
                        <List.Item
                          key={book.title}
                          actions={renderBookAuthors(book.author_name)}
                          extra={
                            <img
                              width={100}
                              alt="logo"
                              src={`https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`}
                            />
                          }
                        >
                          <List.Item.Meta
                            title={book.title}
                            description={`Published on ${book.first_publish_year}`}
                          />
                          <ul>
                            <li>No of Pages: {book.number_of_pages_median || 'unknown'}</li>
                            <li>ISBN Numbers: {book.isbn[0] || "-----"}</li>
                          </ul>
                        </List.Item>
                      )}
                    />
                  </>
                }
                {(!books || books.length <= 0) && debouncedSearchTerm && <b>No Books Found!</b>}
                {(!books || books.length <= 0) && !debouncedSearchTerm && <b>Please start searching for books</b>}
              </>
            }
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Alita Infotech ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </div>
  );
}

export default App;
