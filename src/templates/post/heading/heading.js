/* Vendor imports */
import React from "react";
import PropTypes from "prop-types";
/* App imports */
import TagList from "../../../components/tag-list";
import style from "./heading.module.less";

const Heading = ({ title, tags, cover, coverTitle }) => (
  <div className={style.header}>
    <div className={style.title}>
      <h1>{title}</h1>
      <TagList tags={tags} />
    </div>
    <div className={style.cover} />
  </div>
);

Heading.propTypes = {
  title: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  cover: PropTypes.object.isRequired,
  coverTitle: PropTypes.string
};

export default Heading;
