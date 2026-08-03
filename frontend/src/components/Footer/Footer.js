import React, { Component } from 'react';
import './style.scss';

export class Footer extends Component {
  componentDidMount() {
    // JavaScript code to update the current year
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    // Find the element with the id "currentYear"
    let currentYearElement = document.getElementById("currentYear");

    // Update the content of the element with the current year
    if (currentYearElement) {
      currentYearElement.textContent = currentYear;
    }
  }
  render() {
    return (
      <footer>
        <p className='m-0 fs-sm-2'>Copyright © <span id="currentYear">2020</span> &nbsp; Thoughtmate Systems. All Rights Reserved
        </p>
      </footer>
    )
  }
}

export default Footer;
