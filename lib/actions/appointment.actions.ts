"use server";


import {BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID} from "@/lib/appwrite.config";
import {ID} from "node-appwrite";
import {parseStringify} from "@/lib/utils";

export const createAppointment = async (appointment: CreateAppointmentParams) => {
    try {
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            PATIENT_COLLECTION_ID!,
            ID.unique(),
            {
                appointment
            }
        )
        return parseStringify(newAppointment);
    } catch (error) {
        console.error("An error occurred while creating a new patient:", error);
    }
}