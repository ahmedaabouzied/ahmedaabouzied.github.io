/* Vendor imports */
import React from "react";
import { graphql } from "gatsby";
/* App imports */
import Layout from "../../components/layout";
import SEO from "../../components/seo";
import Heading from "./heading";
import ArticleHeading from "./article-heading";
import Article from "./article";
import Share from "./share";
import Config from "../../../config";
import Utils from "../../utils";
import style from "./post.module.less";

const Post = ({ data, pageContext }) => {
  const { html, frontmatter, timeToRead } = data.markdownRemark;
  const { title, date,  path, excerpt } = frontmatter;
  const translations =
    pageContext.translations.length > 1 ? pageContext.translations : null;
  const canonicalUrl = Utils.resolvePageUrl(
    Config.siteUrl,
    Config.pathPrefix,
    path
  );
  
  return (
    <Layout>
      <SEO
        title={title}
        description={excerpt}
        path={path}
        contentType="article"
        translations={translations}
      />
      <div className={style.container}>
        <Heading title={title} coverTitle={excerpt} />
        <div className={style.content}>
          <ArticleHeading
            excerpt={excerpt}
            date={date}
            time={timeToRead}
            translations={translations}
          />
          <Article html={html} />
          <Share
            pageCanonicalUrl={canonicalUrl}
            title={title}
            description={excerpt}
          />
        </div>
      </div>
    </Layout>
  );
};

export const pageQuery = graphql`
  query($postPath: String!) {
    markdownRemark(frontmatter: { path: { eq: $postPath } }) {
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "DD MMM YYYY")
        path
        excerpt
      }
    }
    allMarkdownRemark(
      filter: {
        frontmatter: { path: { ne: $postPath } }
        fileAbsolutePath: { regex: "/index.md$/" }
      }
    ) {
      edges {
        node {
          frontmatter {
            path
            title
            excerpt
          }
        }
      }
    }
  }
`;
export default Post;
