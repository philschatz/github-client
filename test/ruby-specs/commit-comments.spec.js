/* eslint-env mocha */
const { expect } = require('chai')
const { client, LONG_TIMEOUT, test_repo, test_github_login } = require('../test-config')

describe('Commit Comments', function () {
  this.timeout(LONG_TIMEOUT)

  it('returns a list of all commit comments', () => {
    return client.repos('sferik/rails_admin').comments.fetch()
    .then(() => {
      return true
    })
  })

  it('returns a list of comments for a specific commit', () =>
    client.repos('sferik/rails_admin').commits('629e9fd9d4df25528e84d31afdc8ebeb0f56fbb3').comments.fetch()
    .then(({items}) => expect(items[0].user.login).to.equal('bbenezech'))
  )

  it('returns a single commit comment', () =>
    client.repos('sferik/rails_admin').comments('861907').fetch()
    .then(commit => expect(commit.user.login).to.equal('bbenezech'))
  )

  context('with commit comment', function () {
    before(() =>
      client.repos(test_repo).commits.fetch()
      .then(({items}) => {
        this.commit = items[0]
        return client.repos(test_repo).commits(this.commit.sha).comments.create({body: ':metal:\n:sparkles:\n:cake:'})
        .then(commitComment => {
          this.commit_comment_value = commitComment
          this.commit_comment_fn = client.fromUrl(commitComment.url)
        })
      }
      )
    )

    after(() => {
      const ret = this.commit_comment_fn.remove()
      delete this.commit_comment_fn // needed for PhantomJS. Otherwise it hangs
      return ret
    })

    it('creates a commit comment', () => {
      return expect(this.commit_comment_value.user.login).to.not.be.null
    })

    it('updates a commit comment', () => {
      return this.commit_comment_fn.update({body: ':penguin:'})
      .then(null, err => console.error(err))
      .then(updatedComment => expect(updatedComment.body).to.equal(':penguin:'))
    })

    it('deletes a commit comment', () => {
      return this.commit_comment_fn.remove()
    })
  })
})
