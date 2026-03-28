import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase, generateId } from "@/lib/supabase";

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 12);

    // Admin user
    const adminId = generateId();
    const { data: existingAdmin } = await supabase
      .from("users")
      .select("id")
      .eq("email", "afrozesultana1@gmail.com")
      .single();

    let admin;
    if (!existingAdmin) {
      const { data } = await supabase
        .from("users")
        .insert({
          id: adminId,
          name: "Afroze Sultana",
          email: "afrozesultana1@gmail.com",
          password: hashedPassword,
          role: "admin",
          approved: true,
        })
        .select()
        .single();
      admin = data;
    } else {
      admin = existingAdmin;
    }

    // Student user
    const studentId = generateId();
    const { data: existingStudent } = await supabase
      .from("users")
      .select("id")
      .eq("email", "student@excelacademy.com")
      .single();

    let student;
    if (!existingStudent) {
      const { data } = await supabase
        .from("users")
        .insert({
          id: studentId,
          name: "Fatima Khan",
          email: "student@excelacademy.com",
          password: hashedPassword,
          role: "student",
          approved: true,
          phone: "+91 9876543210",
        })
        .select()
        .single();
      student = data;
    } else {
      student = existingStudent;
    }

    // Pending student
    const { data: existingPending } = await supabase
      .from("users")
      .select("id")
      .eq("email", "pending@excelacademy.com")
      .single();

    if (!existingPending) {
      await supabase.from("users").insert({
        id: generateId(),
        name: "Shaheen Begum",
        email: "pending@excelacademy.com",
        password: hashedPassword,
        role: "student",
        approved: false,
        phone: "+91 9123456789",
      });
    }

    // Courses
    const courses = [
      {
        id: "course-ppttc",
        title: "PPTTC - Pre & Primary Teachers Training",
        description:
          "Master child psychology, teaching techniques, and classroom management for children ages 2-10. A comprehensive 1-year diploma program.",
        duration: "1 Year",
        price: "Contact for details",
        features: JSON.stringify([
          "Child Psychology",
          "Language Learning",
          "Teaching/Learning Process",
          "School Administration",
          "Special Needs Education",
        ]),
      },
      {
        id: "course-montessori",
        title: "Montessori Teacher Training",
        description:
          "Learn Dr. Maria Montessori's child-centered methodology including practical life activities, sensorial education, and classroom management.",
        duration: "1 Year",
        price: "Contact for details",
        features: JSON.stringify([
          "Montessori Philosophy",
          "Practical Life Activities",
          "Sensorial Education",
          "Language & Mathematics",
          "Classroom Management",
        ]),
      },
      {
        id: "course-ecce",
        title: "ECCE - Early Childhood Care & Education",
        description:
          "Specialize in cognitive, social, and psycho-motor development during early childhood years with play-based learning approaches.",
        duration: "1 Year",
        price: "Contact for details",
        features: JSON.stringify([
          "Child Psychology",
          "Pedagogical Approaches",
          "Play & Learning Materials",
          "Child-Centered Curriculum",
          "Songs, Rhymes & Storytelling",
        ]),
      },
      {
        id: "course-deled",
        title: "D.El.Ed - Diploma in Elementary Education",
        description:
          "A comprehensive diploma program for elementary education covering pedagogy, child development, and teaching methodologies.",
        duration: "2 Years",
        price: "Contact for details",
        features: JSON.stringify([
          "Child Development",
          "Elementary Pedagogy",
          "Curriculum Studies",
          "Assessment Methods",
          "Teaching Practice",
        ]),
      },
    ];

    for (const course of courses) {
      const { data: existingCourse } = await supabase
        .from("courses")
        .select("id")
        .eq("id", course.id)
        .single();

      if (!existingCourse) {
        await supabase.from("courses").insert(course);
      }
    }

    // Class sessions for PPTTC
    const sessionTitles = [
      "Introduction to Child Psychology",
      "Principles of Early Childhood Education",
      "Language Learning in Young Children",
      "Teaching & Learning Process",
      "Creative Teaching Methods",
      "Classroom Management Basics",
      "Nutrition, Health & Hygiene",
      "School Administration",
      "Child Abuse & Protection Laws",
      "Special Needs Education Intro",
      "Art & Craft in Teaching",
      "Storytelling Techniques",
      "Music & Movement Activities",
      "Assessment & Evaluation",
      "Lesson Planning Workshop",
      "Practical Teaching Session 1",
      "Practical Teaching Session 2",
      "Parent-Teacher Communication",
      "Technology in Classroom",
      "Final Review & Preparation",
    ];

    const sessions: { id: string }[] = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (20 - i) * 2);
      const sessionId = generateId();

      const { data: existingSession } = await supabase
        .from("class_sessions")
        .select("id")
        .eq("title", `Session ${i + 1}: ${sessionTitles[i]}`)
        .single();

      if (!existingSession) {
        const { data } = await supabase
          .from("class_sessions")
          .insert({
            id: sessionId,
            course_id: "course-ppttc",
            title: `Session ${i + 1}: ${sessionTitles[i]}`,
            date: date.toISOString(),
            duration: 90,
          })
          .select("id")
          .single();
        if (data) sessions.push(data);
      } else {
        sessions.push(existingSession);
      }
    }

    // Attendance for student
    if (student) {
      for (let i = 0; i < Math.min(16, sessions.length); i++) {
        const { data: existingAttendance } = await supabase
          .from("attendance")
          .select("id")
          .eq("user_id", student.id)
          .eq("session_id", sessions[i].id)
          .single();

        if (!existingAttendance) {
          await supabase.from("attendance").insert({
            id: generateId(),
            user_id: student.id,
            session_id: sessions[i].id,
            present: i !== 5 && i !== 12,
          });
        }
      }
    }

    // Exams
    const exam1Questions = JSON.stringify([
      {
        id: "q1",
        question: "Who is known as the father of child psychology?",
        options: ["Jean Piaget", "Sigmund Freud", "John Locke", "B.F. Skinner"],
        correctAnswer: "Jean Piaget",
        marks: 5,
      },
      {
        id: "q2",
        question: "What are Piaget's four stages of cognitive development?",
        options: [
          "Sensorimotor, Preoperational, Concrete Operational, Formal Operational",
          "Oral, Anal, Phallic, Genital",
          "Trust, Autonomy, Initiative, Industry",
          "Attachment, Exploration, Identity, Intimacy",
        ],
        correctAnswer: "Sensorimotor, Preoperational, Concrete Operational, Formal Operational",
        marks: 5,
      },
      {
        id: "q3",
        question: "At what age does a child typically start developing language skills?",
        options: ["6-12 months", "2-3 years", "4-5 years", "Birth"],
        correctAnswer: "6-12 months",
        marks: 5,
      },
      {
        id: "q4",
        question: "What is 'scaffolding' in the context of child education?",
        options: [
          "Providing temporary support to help children learn",
          "Building physical structures in classrooms",
          "A type of punishment",
          "Grouping children by ability",
        ],
        correctAnswer: "Providing temporary support to help children learn",
        marks: 5,
      },
      {
        id: "q5",
        question: "Which theorist proposed the Zone of Proximal Development (ZPD)?",
        options: ["Vygotsky", "Piaget", "Montessori", "Dewey"],
        correctAnswer: "Vygotsky",
        marks: 5,
      },
      {
        id: "q6",
        question: "What is the primary focus of the Montessori method?",
        options: [
          "Child-led, hands-on learning",
          "Teacher-directed instruction",
          "Rote memorization",
          "Competitive learning",
        ],
        correctAnswer: "Child-led, hands-on learning",
        marks: 5,
      },
      {
        id: "q7",
        question: "What does ECCE stand for?",
        options: [
          "Early Childhood Care and Education",
          "Elementary Child Care Education",
          "Early Creative Classroom Education",
          "Educational Child Care Environment",
        ],
        correctAnswer: "Early Childhood Care and Education",
        marks: 5,
      },
      {
        id: "q8",
        question: "Which type of play involves children playing alongside but not with each other?",
        options: ["Parallel play", "Cooperative play", "Solitary play", "Associative play"],
        correctAnswer: "Parallel play",
        marks: 5,
      },
      {
        id: "q9",
        question: "What is the ideal teacher-student ratio for a pre-primary classroom?",
        options: ["1:15", "1:30", "1:50", "1:10"],
        correctAnswer: "1:15",
        marks: 5,
      },
      {
        id: "q10",
        question: "Which of these is NOT a domain of child development?",
        options: [
          "Financial development",
          "Physical development",
          "Cognitive development",
          "Social-emotional development",
        ],
        correctAnswer: "Financial development",
        marks: 5,
      },
    ]);

    const { data: existingExam1 } = await supabase
      .from("exams")
      .select("id")
      .eq("id", "exam-child-psychology")
      .single();

    if (!existingExam1) {
      await supabase.from("exams").insert({
        id: "exam-child-psychology",
        title: "Child Psychology Fundamentals",
        description: "Test your understanding of child development stages, learning theories, and behavioral psychology.",
        course_id: "course-ppttc",
        duration: 30,
        total_marks: 50,
        passing_marks: 25,
        questions: exam1Questions,
      });
    }

    const exam2Questions = JSON.stringify([
      {
        id: "q1",
        question: "What is the Montessori 'prepared environment'?",
        options: [
          "A classroom designed to facilitate independent learning",
          "A room decorated with posters",
          "An outdoor playground",
          "A computer lab",
        ],
        correctAnswer: "A classroom designed to facilitate independent learning",
        marks: 10,
      },
      {
        id: "q2",
        question: "Which teaching method emphasizes learning by doing?",
        options: ["Experiential learning", "Lecture method", "Rote learning", "Drill method"],
        correctAnswer: "Experiential learning",
        marks: 10,
      },
      {
        id: "q3",
        question: "What is differentiated instruction?",
        options: [
          "Adapting teaching to meet diverse student needs",
          "Teaching different subjects",
          "Having different teachers for each class",
          "Grading students differently",
        ],
        correctAnswer: "Adapting teaching to meet diverse student needs",
        marks: 10,
      },
      {
        id: "q4",
        question: "What is the purpose of a lesson plan?",
        options: [
          "To organize teaching objectives, activities, and assessments",
          "To impress the principal",
          "To fill up class time",
          "To assign homework",
        ],
        correctAnswer: "To organize teaching objectives, activities, and assessments",
        marks: 10,
      },
      {
        id: "q5",
        question: "Which is an example of formative assessment?",
        options: ["Class discussion and observation", "Final exam", "Annual report card", "Entrance test"],
        correctAnswer: "Class discussion and observation",
        marks: 10,
      },
      {
        id: "q6",
        question: "What does inclusive education mean?",
        options: [
          "Education that includes all children regardless of abilities",
          "Education only for gifted children",
          "Education in private schools",
          "Education using technology only",
        ],
        correctAnswer: "Education that includes all children regardless of abilities",
        marks: 10,
      },
      {
        id: "q7",
        question: "What is the role of play in early childhood education?",
        options: [
          "It is essential for holistic development",
          "It wastes classroom time",
          "It is only for recess",
          "It distracts from learning",
        ],
        correctAnswer: "It is essential for holistic development",
        marks: 10,
      },
      {
        id: "q8",
        question: "Which classroom management technique uses positive reinforcement?",
        options: ["Praise and rewards", "Punishment", "Ignoring behavior", "Detention"],
        correctAnswer: "Praise and rewards",
        marks: 10,
      },
      {
        id: "q9",
        question: "What is Bloom's Taxonomy used for?",
        options: [
          "Classifying educational learning objectives",
          "Classifying plants and animals",
          "Grading students",
          "Planning school budgets",
        ],
        correctAnswer: "Classifying educational learning objectives",
        marks: 10,
      },
      {
        id: "q10",
        question: "What is the primary goal of early childhood education?",
        options: [
          "Holistic development of the child",
          "Teaching children to read and write",
          "Preparing for competitive exams",
          "Keeping children busy",
        ],
        correctAnswer: "Holistic development of the child",
        marks: 10,
      },
    ]);

    const { data: existingExam2 } = await supabase
      .from("exams")
      .select("id")
      .eq("id", "exam-teaching-methods")
      .single();

    if (!existingExam2) {
      await supabase.from("exams").insert({
        id: "exam-teaching-methods",
        title: "Teaching Methodology Assessment",
        description: "Assess your knowledge of modern teaching methods, classroom management, and educational pedagogy.",
        course_id: "course-montessori",
        duration: 45,
        total_marks: 100,
        passing_marks: 50,
        questions: exam2Questions,
      });
    }

    // Exam attempt for student
    if (student) {
      const { data: existingAttempt } = await supabase
        .from("exam_attempts")
        .select("id")
        .eq("user_id", student.id)
        .eq("exam_id", "exam-child-psychology")
        .single();

      if (!existingAttempt) {
        await supabase.from("exam_attempts").insert({
          id: generateId(),
          user_id: student.id,
          exam_id: "exam-child-psychology",
          answers: JSON.stringify({
            q1: "Jean Piaget",
            q2: "Sensorimotor, Preoperational, Concrete Operational, Formal Operational",
            q3: "6-12 months",
            q4: "Providing temporary support to help children learn",
            q5: "Vygotsky",
            q6: "Child-led, hands-on learning",
            q7: "Early Childhood Care and Education",
            q8: "Parallel play",
            q9: "1:30",
            q10: "Financial development",
          }),
          score: 45,
          total_marks: 50,
          passed: true,
          completed_at: new Date().toISOString(),
        });
      }
    }

    // Assignments
    const assignment1Id = generateId();
    const { data: existingAssignment1 } = await supabase
      .from("assignments")
      .select("id")
      .eq("title", "Lesson Plan for Pre-Primary Class")
      .single();

    let assignment1;
    if (!existingAssignment1) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const { data } = await supabase
        .from("assignments")
        .insert({
          id: assignment1Id,
          title: "Lesson Plan for Pre-Primary Class",
          description:
            "Prepare a detailed 5-day lesson plan for a pre-primary class (ages 3-5). Include learning objectives, activities, materials needed, and assessment methods for each day. Focus on a theme like 'My Family' or 'Animals Around Us'.",
          course_id: "course-ppttc",
          due_date: dueDate.toISOString(),
          total_marks: 100,
        })
        .select("id")
        .single();
      assignment1 = data;
    } else {
      assignment1 = existingAssignment1;
    }

    // More assignments
    const { data: existingAssignment2 } = await supabase
      .from("assignments")
      .select("id")
      .eq("title", "Montessori Teaching Aids Creation")
      .single();

    if (!existingAssignment2) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      await supabase.from("assignments").insert({
        id: generateId(),
        title: "Montessori Teaching Aids Creation",
        description:
          "Create 3 Montessori-inspired teaching aids for sensorial education. Document the materials used, the purpose of each aid, age group suitability, and how to present it to children. Include photographs of your teaching aids.",
        course_id: "course-montessori",
        due_date: dueDate.toISOString(),
        total_marks: 100,
      });
    }

    const { data: existingAssignment3 } = await supabase
      .from("assignments")
      .select("id")
      .eq("title", "Child Observation Report")
      .single();

    if (!existingAssignment3) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);
      await supabase.from("assignments").insert({
        id: generateId(),
        title: "Child Observation Report",
        description:
          "Observe a child (age 2-6) for one week and write a detailed developmental report covering physical, cognitive, social-emotional, and language development. Include recommendations for supporting the child's growth.",
        course_id: "course-ecce",
        due_date: dueDate.toISOString(),
        total_marks: 50,
      });
    }

    // Submission for student
    if (student && assignment1) {
      const { data: existingSubmission } = await supabase
        .from("assignment_submissions")
        .select("id")
        .eq("user_id", student.id)
        .eq("assignment_id", assignment1.id)
        .single();

      if (!existingSubmission) {
        await supabase.from("assignment_submissions").insert({
          id: generateId(),
          user_id: student.id,
          assignment_id: assignment1.id,
          content:
            "Completed 5-day lesson plan on 'My Family' theme with circle time, art activities, storytelling, and role play sessions. Each day includes warm-up, main activity, and cool-down with clear objectives.",
          marks: 88,
          status: "graded",
          feedback:
            "Excellent lesson plan! Very well structured with age-appropriate activities. The assessment rubric is particularly well thought out. Consider adding more outdoor activities.",
        });
      }
    }

    // Feedback
    if (student) {
      const { data: existingFeedback } = await supabase
        .from("feedback")
        .select("id")
        .eq("user_id", student.id)
        .single();

      if (!existingFeedback) {
        await supabase.from("feedback").insert({
          id: generateId(),
          user_id: student.id,
          subject: "Wonderful Learning Experience",
          message:
            "Excel Academy gave me the skills and confidence to become a successful pre-primary teacher. The practical training sessions were invaluable and the faculty is extremely supportive.",
          rating: 5,
          category: "course",
        });
      }
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      users: {
        admin: admin?.email || "afrozesultana1@gmail.com",
        student: "student@excelacademy.com",
        pending: "pending@excelacademy.com (not yet approved)",
      },
      note: "Password for all users: password123",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed", details: String(error) }, { status: 500 });
  }
}
