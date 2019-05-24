/* Vendor imports */
import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
/* App imports */
import Layout from '../../components/layout'
import SEO from '../../components/seo'
import Utils from '../../utils'
import * as style from './index.module.less'

const About = ({ data: { profilePhoto, skillIcons, toolIcons } }) => {
  return (
    <Layout>
      <SEO
        title="About"
        description="A brief summary of this blog and my work"
        path="about"
      />
      <div className={style.container}>
        <div className={style.photo}>
          <Img fluid={profilePhoto.childImageSharp.fluid} />
        </div>
        <div className={style.content}>
          <h1>Ahmed Abouzied</h1>
          <h2>Software Developer</h2>
          <p>
I am a full stack developer . with very good experience in developing both Front-end , Back-end applications and Mobile applications for android.
</p>
<p>
I studied many courses  and worked through many books in back-end development , database systems , front-end frameworks and algorithms and data structures.
</p><p>
I have very experience with the following programming languages : 
  C / C++   ,  Go ,  Javascript / NodeJs ,  Dart , Python , Java , PHP
</p><p>
I am very familiar with these front-end frameworks : 
  Angular , React , VueJs 
</p><p>
And these back-end frameworks and utilities : 
 Node , express , Flutter(for building mobile applications) , the android platform , Gin / Mux 
  (Golang web server frameworks) , Laravel , websockets.
</p><p>
I use docker  , containers , Kubernetes to deploy the web applications to the production server. 
</p><p>
I also know how to operate these databases and integrate them into web / mobile applications : 
  MySQL , SQLlite , PostgreSQL , Mongodb 
</p><p>
I am also familiar with DNS , FTP , Apache web server , Nginx web server. 
</p><p>
I have worked on many front end , back end , android and full stack projects using every technology mentioned earlier.
          </p>
          <br />
          {/* <h2>Skills</h2>
          <ImageList edges={skillIcons.edges} />
          <h2>Tools</h2>
          <ImageList edges={toolIcons.edges} /> */}
        </div>
      </div>
    </Layout>
  )
}

About.propTypes = {
  data: PropTypes.shape({
    profilePhoto: PropTypes.shape({
      childImageSharp: PropTypes.shape({
        fluid: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
    skillIcons: PropTypes.object.isRequired,
    toolIcons: PropTypes.object.isRequired,
  }),
}

const ImageList = ({ edges }) => (
  <div className={style.iconsContainer}>
    {edges
      .sort((edgeA, edgeB) =>
        edgeA.node.name.toLowerCase() > edgeB.node.name.toLowerCase() ? 1 : -1
      )
      .map(({ node: { name, childImageSharp } }) => (
        <div className={style.iconWrapper} key={name}>
          <Img
            fixed={childImageSharp.fixed}
            alt={name + ' logo'}
            title={name}
          />
          <label>
            {iconsNameMap[name] ? iconsNameMap[name] : Utils.capitalize(name)}
          </label>
        </div>
      ))}
  </div>
)

ImageList.propTypes = {
  edges: PropTypes.arrayOf(
    PropTypes.shape({
      node: PropTypes.shape({
        name: PropTypes.string.isRequired,
        childImageSharp: PropTypes.shape({
          fixed: PropTypes.object.isRequired,
        }).isRequired,
      }).isRequired,
    })
  ).isRequired,
}

export const query = graphql`
  {
    profilePhoto: file(name: { eq: "profile-photo" }) {
      childImageSharp {
        fluid(maxWidth: 800) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    skillIcons: allFile(filter: { dir: { regex: "/about/skills$/" } }) {
      edges {
        node {
          name
          childImageSharp {
            fixed(width: 50) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
    }
    toolIcons: allFile(filter: { dir: { regex: "/about/tools$/" } }) {
      edges {
        node {
          name
          childImageSharp {
            fixed(width: 50) {
              ...GatsbyImageSharpFixed_tracedSVG
            }
          }
        }
      }
    }
  }
`
// Use to set specific icons names
const iconsNameMap = {
  css: 'CSS',
  html: 'HTML',
  jquery: 'JQuery',
  nodejs: 'Node.js',
  vuejs: 'Vue.js',
  gruntjs: 'Grunt.js',
}

export default About
