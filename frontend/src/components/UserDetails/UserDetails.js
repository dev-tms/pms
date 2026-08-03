import React from 'react';
import './style.scss';
import { Form, Container } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

const UserDetails = (props) => {

    console.log(props.contact)
    const { email, vm_password, full_legal_name, corporate_id_number, dob, dl_info, home_address, phone, vm_email, corp_1_name, corp_1_check_address, corp_1_biz_email, corp_1_empwd, corp_1_email_server, corp_1_emun, corp_1_biz_phone, corp_2_name, corp_2_check_address, corp_2_biz_email, corp_2_empwd, corp_2_email_server, corp_2_emun, corp_2_biz_phone, bank, bk_num, bk_rt_num, bk_add, MSA, fund, status, personalBankName, personalAccountName, personalAcct, personalRouting, typeOfAccount, registeredAgentUsername, registeredAgentPassword, state } = props?.contact ? props.contact : {}
    return (
      <div className='main detail-page'>
        <Container>
          <div className='row'>
            <div className='col-12'>
              <div className="d-flex justify-content-center align-items-center user-form-container user-details py-5" >
                <div style={{ width: '1200px' }} className='user-form-wrapper'>
                 
                  <div className='heading-wrapper'>
                    <h1>Contact Details</h1>
                  </div>
                  <Form className='user-form'>
                    <fieldset>
                      <legend>Referral Record Details</legend>
                      <Form.Group controlId="formBasicReferralName" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Referral Name:</Form.Label>
                            <Form.Control
                              type="text"
                              name="full_legal_name"
                              placeholder="Referral Name"
                              readOnly
                              className='col-sm lable'
                              value={full_legal_name}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>SSN:</Form.Label>
                            <Form.Control
                              type="text"
                              name="corporate_id_number"
                              placeholder="SSN"
                              readOnly
                              className='col-sm lable'
                              value={corporate_id_number}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>DOB:</Form.Label>
                            <Form.Control
                              type="date"
                              name="dob"
                              readOnly
                              className='col-sm lable'
                              value={dob}
                            />
                          </div>
                        </div>

                      </Form.Group>

                      <Form.Group controlId="formBasicDetails" className="pb-3 row">

                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>DL # :</Form.Label>
                            <Form.Control
                              type="text"
                              name="dl_info"
                              placeholder=" DL #"
                              readOnly
                              className='col-sm lable'
                              value={dl_info}
                            />
                          </div>
                        </div>

                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Email:</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              placeholder="Personal Email"
                              readOnly
                              className='col-sm lable'
                              value={email}
                            />
                          </div>
                        </div>

                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>Home Address:</Form.Label>
                            <Form.Control
                              as="textarea"
                              name="home_address"
                              placeholder="Home Address"
                              rows={3}
                              readOnly
                              className='col-sm lable'
                              value={home_address}
                            />
                          </div>

                        </div>
                      </Form.Group>


                      <Form.Group controlId="formBasicDetails" className="pb-3 row">

                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Phone:</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              placeholder="Personal Phone"
                              readOnly
                              className='col-sm lable'
                              value={phone}
                            />
                          </div>
                        </div>

                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>VM Username:</Form.Label>
                            <Form.Control
                              type="text"
                              name="vm_email"
                              placeholder="VM Username"
                              readOnly
                              className='col-sm lable'
                              value={vm_email}
                            />
                          </div>

                        </div>
                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>VM Password:</Form.Label>
                            <Form.Control
                              type="text"
                              name="vm_password"
                              placeholder="VM Password"
                              readOnly
                              className='col-sm lable'
                              value={vm_password}
                            />
                          </div>

                        </div>
                      </Form.Group>

                    </fieldset>

                    <fieldset>
                      <legend>Corp 1 Business Details</legend>
                      <Form.Group controlId="formBasicCorp1Details" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_1_name"
                              placeholder="Corp 1 Name"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_name}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Business Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="corp_1_biz_email"
                              placeholder="Corp 1 Business Email"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_biz_email}
                            />
                          </div>
                        </div>

                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Business Email Password</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_1_empwd"
                              placeholder="Corp 1 Business Email Password"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_empwd}
                            />
                          </div>
                        </div>


                      </Form.Group>
                      <Form.Group controlId="formBasicCorp1Details" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Email Server</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_1_email_server"
                              placeholder="Corp 1 Email Server"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_email_server}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Email Username</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_1_emun"
                              placeholder="Corp 1 Email Username"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_emun}
                            />
                          </div>
                        </div>

                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 1 Business Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="corp_1_biz_phone"
                              placeholder="Corp 1 Business Phone Number"
                              readOnly
                              className='col-sm lable'
                              value={corp_1_biz_phone}
                            />
                          </div>
                        </div>
                      </Form.Group>


                      <Form.Group controlId="formBasicCorp1BusinessAddress" className="pb-3">
                        <div className=''>
                          <Form.Label className='col-sm w-11'>Corp 1 Business Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="corp_1_check_address"
                            placeholder="Corp 1 Business Address"
                            rows={3}
                            readOnly
                            className='col-sm lable'
                            value={corp_1_check_address}
                          />
                        </div>
                      </Form.Group>
                    </fieldset>
                    <fieldset>
                      <legend>Corp 2 Business Details</legend>
                      <Form.Group controlId="formBasicCorp2Business" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_2_name"
                              placeholder="Corp 2 Name"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_name}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Business Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="corp_2_biz_email"
                              placeholder="Corp 2 Business Email"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_biz_email}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Business Email Password</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_2_empwd"
                              placeholder="Corp 2 Business Email Password"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_empwd}
                            />
                          </div>
                        </div>
                      </Form.Group>
                      <Form.Group controlId="formBasicCorp2Business" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Email Server</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_2_email_server"
                              placeholder="Corp 2 Email Server"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_email_server}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Email Username</Form.Label>
                            <Form.Control
                              type="text"
                              name="corp_2_emun"
                              placeholder="Corp 2 Email Username"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_emun}
                            />
                          </div>

                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Corp 2 Business Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="corp_2_biz_phone"
                              placeholder="Corp 2 Business Phone Number"
                              readOnly
                              className='col-sm lable'
                              value={corp_2_biz_phone}
                            />
                          </div>
                        </div>
                      </Form.Group>


                      <Form.Group controlId="formBasicCorp2BusinessAddress" className="pb-3">
                        <div className=''>
                          <Form.Label className='col-sm w-11'>Corp 2 Business Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            name="corp_2_check_address"
                            placeholder="Corp 2 Business Address"
                            rows={3}
                            readOnly
                            className='col-sm lable'
                            value={corp_2_check_address}
                          />
                        </div>
                      </Form.Group>
                    </fieldset>

                    <fieldset>
                      <legend>Monthly Payment Record  Details</legend>
                      <Form.Group controlId="formBasicBank" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Bank</Form.Label>
                            <Form.Control
                              type="text"
                              name="bank"
                              placeholder="Bank"
                              readOnly
                              className='col-sm lable'
                              value={bank}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Account #</Form.Label>
                            <Form.Control
                              type="text"
                              name="bk_num"
                              placeholder="Account #"
                              readOnly
                              className='col-sm lable'
                              value={bk_num}
                            />
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group controlId="formBasicRoutingNumber" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Routing #</Form.Label>
                            <Form.Control
                              type="text"
                              name="bk_rt_num"
                              placeholder="Routing #"
                              readOnly
                              className='col-sm lable'
                              value={bk_rt_num}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Address</Form.Label>
                            <Form.Control
                              as="textarea"
                              name="bk_add"
                              placeholder="Address"
                              rows={1}
                              readOnly
                              className='col-sm lable'
                              value={bk_add}
                            />
                          </div>
                        </div>
                      </Form.Group>
                    </fieldset>

                    <fieldset>
                      <legend>Additional Record  Details</legend>
                      <Form.Group controlId="formBasicBank" className="pb-3 row">

                        <div className='col'>
                          <div className=''>
                            <Form.Label className='col-sm'>MSA</Form.Label>
                            <Form.Control
                              type="text"
                              name="msa"
                              placeholder="MSA"
                              readOnly
                              className='col-sm lable'
                              value={MSA}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Fund</Form.Label>
                            <Form.Control
                              type="text"
                              name="fund"
                              placeholder="Fund"
                              readOnly
                              className='col-sm lable'
                              value={fund}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Status </Form.Label>
                            <Form.Control
                              type="text"
                              name="status"
                              placeholder="Status #"
                              readOnly
                              className='col-sm lable'
                              value={status}
                            />
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group controlId="formBasicDetails" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Bank Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="personalBankName"
                              placeholder="Personal Bank Name"
                              readOnly
                              className='col-sm lable'
                              value={personalBankName}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Account Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="personalAccountName"
                              placeholder="Personal Account Name"
                              readOnly
                              className='col-sm lable'
                              value={personalAccountName}
                            />
                          </div>
                        </div>

                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Acct #</Form.Label>
                            <Form.Control
                              type="text"
                              name="personalAcct"
                              placeholder="Personal Acct #"
                              readOnly
                              className='col-sm lable'
                              value={personalAcct}
                            />
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group controlId="formBasicDetails" className="pb-3 row">
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Personal Routing </Form.Label>
                            <Form.Control
                              type="text"
                              name="personalRouting"
                              placeholder="Personal Routing "
                              readOnly
                              className='col-sm lable'
                              value={personalRouting}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Type of Account</Form.Label>
                            <Form.Control
                              type="text"
                              name="typeOfAccount"
                              placeholder="type of account"
                              readOnly
                              className='col-sm lable'
                              value={typeOfAccount}
                            />
                          </div>
                        </div>

                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>Registered Agent Username</Form.Label>
                            <Form.Control
                              type="text"
                              name="registeredAgentUsername"
                              placeholder="Registered Agent Username"
                              readOnly
                              className='col-sm lable'
                              value={registeredAgentUsername}
                            />
                          </div>
                        </div>
                      </Form.Group>

                      <Form.Group controlId="formBasicDetails" className="pb-3 row">
                        <div className="col-sm-4">
                          <div className=''>
                            <Form.Label className='col-sm'>Registered Agent Password</Form.Label>
                            <Form.Control
                              type="text"
                              name="registeredAgentPassword"
                              placeholder="Registered Agent Password "
                              readOnly
                              className='col-sm lable'
                              value={registeredAgentPassword}
                            />
                          </div>
                        </div>
                        <div className="col">
                          <div className=''>
                            <Form.Label className='col-sm'>State</Form.Label>
                            <Form.Control
                              type="text"
                              name="state"
                              placeholder="State"
                              readOnly
                              className='col-sm lable'
                              value={state}
                            />
                          </div>
                        </div>

                      </Form.Group>
                    </fieldset>

                  </Form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    )
}

export default withRouter(UserDetails);
