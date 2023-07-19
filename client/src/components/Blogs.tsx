import * as React from 'react';

import { History } from 'history';
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react';

import { createBlog, deleteBlog, getBlogs, searchBlog } from '../api/blogs-api';
import Auth from '../auth/Auth';
import { Blog } from '../types/Blog';

interface BlogsProps {
  auth: Auth;
  history: History;
}

interface BlogsState {
  blogs: Blog[];
  newBlogName: string;
  loadingBlogs: boolean;
  searchText: string;
  total: number;
}

export class Blogs extends React.PureComponent<BlogsProps, BlogsState> {
  state: BlogsState = {
    blogs: [],
    newBlogName: '',
    loadingBlogs: true,
    searchText: '',
    total: 0,
  };

  // Start Search
  handleSearch = async () => {
    this.setState({ ...this.state, loadingBlogs: true });
    const idToken = this.props.auth.getIdToken();
    const { searchText: searchKey } = this.state;
    let data: Blog[] = [];

    if (searchKey === '') {
      data = await getBlogs(idToken);
    } else {
      data = await searchBlog(searchKey, idToken);
    }
    this.setState({ blogs: data, loadingBlogs: false });
  };

  handleSearchKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ...this.state, searchText: e.target.value });
  };
  // End Search

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBlogName: event.target.value });
  };

  onEditButtonClick = (blogId: string) => {
    this.props.history.push(`/blogs/${blogId}/edit`);
  };

  onBlogCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newBlog = await createBlog(this.props.auth.getIdToken(), {
        name: this.state.newBlogName,
      });
      this.setState({
        blogs: [...this.state.blogs, newBlog],
        newBlogName: '',
      });
    } catch {
      alert('Blog creation failed');
    }
  };

  onBlogDelete = async (blogId: string) => {
    try {
      await deleteBlog(this.props.auth.getIdToken(), blogId);
      this.setState({
        blogs: this.state.blogs.filter((c) => c.blogId !== blogId),
      });
    } catch {
      alert('Blog deletion failed');
    }
  };

  async componentDidMount() {
    try {
      const blogs = await getBlogs(this.props.auth.getIdToken());
      this.setState({
        blogs,
        loadingBlogs: false,
      });
    } catch (e) {
      alert(`Failed to fetch blogs: ${(e as Error).message}`);
    }
  }

  render() {
    return (
      <div>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1">Blogs</Header>
            </Grid.Column>
            <Grid.Column>
              <Input
                action={{
                  icon: 'search',
                  onClick: this.handleSearch,
                }}
                fluid
                placeholder="Enter your search text..."
                onChange={this.handleSearchKeyChange}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br />
        {this.renderCreateBlogInput()}
        {this.renderBlogs()}
      </div>
    );
  }

  renderCreateBlogInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'green',
              labelPosition: 'left',
              icon: 'add',
              content: 'New blog',
              onClick: this.onBlogCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  renderBlogs() {
    if (this.state.loadingBlogs) {
      return this.renderLoading();
    }

    return this.renderBlogsList();
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading BLOGs
        </Loader>
      </Grid.Row>
    );
  }

  renderBlogsList() {
    return (
      <Grid padded>
        <Grid.Row>
          {/* <Grid.Column width={3} verticalAlign="middle">Select</Grid.Column> */}
          <Grid.Column width={4} verticalAlign="middle">
            <b>Blog Name</b>
          </Grid.Column>
          <Grid.Column width={4} verticalAlign="middle">
            <b>Image</b>
          </Grid.Column>
          <Grid.Column width={3} verticalAlign="middle">
            <b>Start Date</b>
          </Grid.Column>
          <Grid.Column width={2} verticalAlign="middle">
            <b>Duration (months)</b>
          </Grid.Column>
          <Grid.Column width={3} verticalAlign="middle">
            <b>Action</b>
          </Grid.Column>
          <Grid.Column width={16}>
            <Divider />
          </Grid.Column>
        </Grid.Row>
        {this.state.blogs.map((blog, pos) => {
          return (
            <Grid.Row key={blog.blogId}>
              <Grid.Column width={4} verticalAlign="middle">
                {blog.name}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {blog.attachmentUrl && <Image src={blog.attachmentUrl} size="small" wrapped />}
              </Grid.Column>
              <Grid.Column width={3} floated="right"></Grid.Column>
              <Grid.Column width={2} floated="right"></Grid.Column>
              <Grid.Column width={3} floated="right">
                <Button icon color="blue" onClick={() => this.onEditButtonClick(blog.blogId)}>
                  <Icon name="pencil" />
                </Button>
                <Button icon color="red" onClick={() => this.onBlogDelete(blog.blogId)}>
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          );
        })}
      </Grid>
    );
  }
}
