import * as React from 'react';

import { History } from 'history';
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react';

import { createBlog, deleteBlog, getBlogs, searchBlogs } from '../api/blogs-api';
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
      data = await searchBlogs(searchKey, idToken);
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

  onImageError = ({ target }: Event) => {
    if (!target) return;

    (target as HTMLImageElement).onerror = null;
    (target as HTMLImageElement).src = './Image_not_available.png';
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
        <Grid columns={1}>
          <Grid.Row>
            <Grid.Column>
              <Header as="h1" textAlign="center" color="blue">
                MY COLLECTIONS
              </Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Input
                action={{
                  icon: 'search',
                  onClick: this.handleSearch,
                }}
                fluid
                placeholder="Search blogs by name..."
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
              color: 'blue',
              labelPosition: 'left',
              icon: 'add',
              content: 'New blog',
              onClick: this.onBlogCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="Blog name..."
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
          Loading...
        </Loader>
      </Grid.Row>
    );
  }

  renderBlogsList() {
    return (
      <Grid padded>
        <Grid.Row>
          <Grid.Column width={4} verticalAlign="middle">
            <b>Photo Name</b>
          </Grid.Column>
          <Grid.Column width={6} verticalAlign="middle">
            <b>Image</b>
          </Grid.Column>
          <Grid.Column width={3} verticalAlign="middle">
            <b>Created At</b>
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
              <Grid.Column width={4} verticalAlign="top">
                {blog.name}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle">
                {blog.attachmentUrl && <Image src={blog.attachmentUrl} size="medium" onError={this.onImageError} wrapped />}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="top" floated="right">
                {new Date(blog.createdAt).toLocaleString()}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="top" floated="right">
                <Button icon color="blue" onClick={() => this.onEditButtonClick(blog.blogId)}>
                  <Icon name="camera" />
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
