'use client'

import {
    Form,
    FormGroup,
    TextField,
    DateField,
} from '@/components/common/forms'
import { ActBlueDonor, ActBlueLineitem } from '@/contracts/data'
import Link from 'next/link'

export interface contributionData {
    total: number
    hasActiveRecurring: boolean
    lineitems: ActBlueLineitem[]
}

export interface DonorViewProps {
    selectedEmail: string
    donor: ActBlueDonor
    makeFormTitle: (donor: ActBlueDonor) => string
    contributions: contributionData
}

export function DonorView({
    selectedEmail,
    donor,
    makeFormTitle,
    contributions,
}: DonorViewProps) {
    return (
        <Form<ActBlueDonor>
            key={selectedEmail}
            form={donor}
            title={makeFormTitle(donor)}
            readonly={true}
            saving={false}
            isInvalid={false}
            onUpdate={() => {
                return
            }}
            onSave={() => {
                return
            }}
        >
            <FormGroup title="Contact Info">
                <TextField label="First Name" field="firstname" required />
                <TextField label="Last Name" field="lastname" required />
                <TextField label="Email" field="email" readonly />
                <TextField label="Phone Number" field="phone" />
            </FormGroup>
            <FormGroup title="Address">
                <TextField label="Street Address" field="addr1" />
                <TextField label="City" field="city" />
                <TextField label="State" field="state" />
                <TextField label="Zip Code" field="zip" />
                <TextField label="Country" field="country" />
            </FormGroup>
            <FormGroup title="Employer Info">
                <TextField<ActBlueDonor>
                    label="Employer Name"
                    getter={(form) => form.employerData?.employer}
                />
                <TextField<ActBlueDonor>
                    label="Occupation"
                    getter={(form) => form.employerData?.occupation}
                />
                <TextField<ActBlueDonor>
                    label="Employer Street Address"
                    getter={(form) => form.employerData?.employerAddr1}
                />
                <TextField<ActBlueDonor>
                    label="Employer City"
                    getter={(form) => form.employerData?.employerCity}
                />
                <TextField<ActBlueDonor>
                    label="Employer State"
                    getter={(form) => form.employerData?.employerState}
                />
                <TextField<ActBlueDonor>
                    label="Employer Zip Code"
                    getter={(form) => `${form.employerData?.employerZip ?? ''}`}
                />
                <TextField<ActBlueDonor>
                    label="Employer Country"
                    getter={(form) => form.employerData?.employerCountry}
                />
            </FormGroup>
            <FormGroup title="Contributions" wrapper>
                <FormGroup title="All Time Stats" subGroup>
                    <TextField<ActBlueDonor>
                        label="Total Dollar Donations"
                        getter={() => `$${contributions.total}`}
                    />
                    <TextField<ActBlueDonor>
                        label="Currently Has a Recurring Donation"
                        getter={() => `${contributions.hasActiveRecurring}`}
                    />
                    <TextField<ActBlueDonor>
                        label="Total Contributions"
                        getter={() => `${contributions.lineitems.length}`}
                    />
                </FormGroup>
                {(contributions.lineitems ?? []).map((lineitem) => (
                    <FormGroup
                        title={`${lineitem.lineitemId}`}
                        key={lineitem.lineitemId}
                        defaultCollapsed
                        subGroup
                    >
                        <DateField<ActBlueDonor>
                            label="Paid At"
                            getter={() => lineitem.paidAt}
                        />
                        <TextField<ActBlueDonor>
                            label="Sequence"
                            getter={() => `${lineitem.sequence}`}
                        />
                        <TextField<ActBlueDonor>
                            label="Amount"
                            getter={() => `$${lineitem.amount}`}
                        />
                        <TextField<ActBlueDonor>
                            label="Recurring Amount"
                            getter={() => `$${lineitem.recurringAmount}`}
                        />
                        <TextField<ActBlueDonor>
                            label="Amount Less AB Fees"
                            getter={() => `$${lineitem.amountLessAbFees}`}
                        />
                        <br />
                        <Link
                            href={{
                                pathname: `/admin/panels/contributions`,
                                query: {
                                    lineitemId: lineitem.lineitemId,
                                },
                            }}
                        >
                            Full Details
                        </Link>
                    </FormGroup>
                ))}
            </FormGroup>
        </Form>
    )
}
