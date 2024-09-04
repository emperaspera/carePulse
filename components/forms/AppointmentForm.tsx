"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomFormField from "@/components/CustomFormField";
import SubmitButton from "@/components/SubmitButton";
import {useState} from "react";
import {getAppointmentSchema} from "@/lib/validation";
import {useRouter} from "next/navigation";
import {register} from "next/dist/client/components/react-dev-overlay/pages/client";
import {createUser} from "@/lib/actions/patient.actions";
import {Doctors} from "@/constants";
import {SelectItem} from "@/components/ui/select";
import Image from "next/image";
import {createAppointment} from "@/lib/actions/appointment.actions";

export enum FormFieldType {
    INPUT = 'input',
    TEXTAREA = 'textarea',
    PHONE_INPUT = 'phoneinput',
    CHECKBOX = 'checkbox',
    DATE_PICKER = 'datePicker',
    SELECT = 'select',
    SKELETON = 'skeleton'
}



const AppointmentForm = ({userId, patientId, type}: {
    userId: string;
    patientId: string;
    type: "create" | "cancel" | "schedule";
}) => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const AppointmentFormValidation = getAppointmentSchema(type);
    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: "",
            schedule: new Date(),
            reason: "",
            note: ""
        },
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
        setIsLoading(true);

        let status;
        switch(type) {
            case 'schedule':
                status = "scheduled";
                break;
            case 'cancel':
                status = "canceled";
                break;
            default:
                status = "pending";
                break;
        }

        try {
            if(type === 'create' && patientId) {
                const appointmentData = {
                    userId,
                    patient: patientId,
                    primaryPhysician: values.primaryPhysician,
                    schedule:new Date(values.schedule),
                    reason: values.reason!,
                    note: values.note,
                    status: status as Status
                }
                console.log(appointmentData);
                const appointment = await createAppointment(appointmentData);
                console.log(appointment);
                if(appointment) {
                    form.reset();
                    router.push(`patients/${userId}/new-appointment/success?appointmentId=${appointment.id}`)
                }
            }
        } catch(error) {
            console.log(error);
        }
    }

    let buttonLabel;

    switch (type) {
        case 'cancel':
            buttonLabel = 'Cancel Appointment';
            break;
        case 'create':
            buttonLabel = 'Create Appointment';
            break;
        case 'schedule':
            buttonLabel = 'Schedule Appointment';
            break;
        default:
            break;
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">
                <section className="mb-12 space-y-4">
                    <h1 className="header">Hey there! 👋</h1>
                    <p className="text-dark-700">Request a new appointment in 10 seconds</p>
                </section>

                {type !== "cancel" && (
                    <>

                        <CustomFormField
                            fieldType={FormFieldType.SELECT}
                            control={form.control}
                            name="doctor"
                            label="Doctor"
                            placeholder="Select a doctor"
                        >
                            {Doctors.map((doctor, i) => (
                                <SelectItem key={doctor.name + i} value={doctor.name}>
                                    <div className="flex cursor-pointer items-center gap-2">
                                        <Image
                                            src={doctor.image}
                                            width={32}
                                            height={32}
                                            alt="doctor"
                                            className="rounded-full border border-dark-500"
                                        />
                                        <p>{doctor.name}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </CustomFormField>

                        <CustomFormField
                            fieldType={FormFieldType.DATE_PICKER}
                            control={form.control}
                            name="appointmentDate"
                            label="Appointment Date"
                            showTimeSelect
                            dateFormat="MM/dd/yyyy - h:mm aa"
                        />

                        <div className="flex flex-col gap-6 xl:flex-row">
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="reason"
                                label="Appointment reason"
                                placeholder="ex: Annual monthly check-up"
                            />

                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="note"
                                label="Comments/notes"
                                placeholder="ex: Prefer afternoon appointments, if possible"
                            />
                        </div>

                    </>
            )}
                {type === "cancel" && (
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="cancellationReason"
                        label="Cancellation Reason"
                        placeholder="Enter reason for cancellation"
                    />
                )}
                <SubmitButton isLoading={isLoading} className={`${type ==='cancel' ? 'shad-danger-btn':'shad-primary-btn'} w-full`}>{buttonLabel}</SubmitButton>


            </form>
        </Form>
    );
}

export default AppointmentForm;