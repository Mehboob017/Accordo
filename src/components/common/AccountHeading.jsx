"use client";

import React from 'react';

const AccountHeading = ({ title }) => {

  return (
    <div className="title-header">
      <div className="d-flex align-items-center">
        <h5>{title}</h5>
      </div>
    </div>
  );
};

export default AccountHeading;
