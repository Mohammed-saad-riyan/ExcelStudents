import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase, generateId } from "@/lib/supabase";

// PRE-PRIMARY TEACHER TRAINING EXAM - Full question paper
const prePrimaryExam = {
  title: "PRE-PRIMARY TEACHER TRAINING - Final Examination",
  description: "Comprehensive final examination covering child psychology, teaching methods, and early childhood education principles.",
  duration: 90, // 90 minutes as requested
  totalMarks: 100,
  passingMarks: 40,
  instructions: `
EXCEL ACADEMY - Forum for Excellence in Teachers Training
FINAL EXAMINATION: PRE-PRIMARY TEACHER TRAINING

Time: 90 Minutes | Maximum Marks: 100

INSTRUCTIONS:
1. This exam consists of 4 sections (A, B, C, D)
2. Section A: Multiple Choice Questions - Attempt ALL questions (10 marks)
3. Section B: Fill in the Blanks - Attempt ALL questions (10 marks)
4. Section C: Short Answer Questions - Attempt ANY 5 out of 7 (30 marks)
5. Section D: Long Answer Questions - Attempt ANY 5 out of 6 (50 marks)
6. Read each question carefully before answering
7. Your exam will auto-submit after 90 minutes
  `.trim(),
  sections: [
    {
      type: "mcq",
      title: "Section A: Multiple Choice Questions",
      instructions: "Attempt all questions. Each question carries 1 mark. Total: 10 Marks",
      totalMarks: 10,
      questions: [
        {
          id: "mcq1",
          question: 'The word "Psychology" is derived from two Greek words, "Psyche" and "Logos," which mean:',
          options: ["Science of Mind", "Science of Soul", "Science of Behavior", "Science of Consciousness"],
          marks: 1
        },
        {
          id: "mcq2",
          question: 'The "Play Way" method was first used by:',
          options: ["Maria Montessori", "Friedrich Froebel", "Caldwell Cook", "Jean Piaget"],
          marks: 1
        },
        {
          id: "mcq3",
          question: "At the age of 6, a child's brain is approximately what percentage of its adult size?",
          options: ["50%", "70%", "90%", "100%"],
          marks: 1
        },
        {
          id: "mcq4",
          question: "Which vitamin protects children from Scurvy?",
          options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
          marks: 1
        },
        {
          id: "mcq5",
          question: "In the Montessori system, the teacher is referred to as the:",
          options: ["Instructor", "Facilitator", "Directress", "Gardener"],
          marks: 1
        },
        {
          id: "mcq6",
          question: "A child who reads at a lower academic level than they speak may be showing signs of:",
          options: ["ADHD", "Dyslexia", "Malnutrition", "Egocentrism"],
          marks: 1
        },
        {
          id: "mcq7",
          question: 'The three "Golden Words" of social rules are:',
          options: ["Hello, Hi, Bye", "Please, Excuse me, Thank you", "Listen, Read, Write", "Eat, Sleep, Play"],
          marks: 1
        },
        {
          id: "mcq8",
          question: "Writing is considered a:",
          options: ["Receptive skill", "Productive skill", "Passive skill", "Sensory skill"],
          marks: 1
        },
        {
          id: "mcq9",
          question: "The originator of the Kindergarten system was:",
          options: ["Maria Montessori", "Jean Piaget", "Friedrich Froebel", "B.F. Skinner"],
          marks: 1
        },
        {
          id: "mcq10",
          question: 'Which deficiency causes "Goiter"?',
          options: ["Iron", "Calcium", "Iodine", "Protein"],
          marks: 1
        }
      ]
    },
    {
      type: "fillBlanks",
      title: "Section B: Fill in the Blanks",
      instructions: "Attempt all questions. Each question carries 1 mark. Total: 10 Marks",
      totalMarks: 10,
      questions: [
        { id: "fb1", question: "Psychology is defined by B.F. Skinner as a science of ________ and experiences.", marks: 1 },
        { id: "fb2", question: "________ development refers to smaller, more precise movements using hands and fingers.", marks: 1 },
        { id: "fb3", question: "The full form of IEP is ________.", marks: 1 },
        { id: "fb4", question: "________ motivation is driven by internal interest or enjoyment in a task.", marks: 1 },
        { id: "fb5", question: "A ________ is a visual presentation of the ways in which concepts relate to one another.", marks: 1 },
        { id: "fb6", question: 'The term "Personality" means _________.', marks: 1 },
        { id: "fb7", question: "________ is an impairment of health resulting from a deficiency or imbalance of nutrients.", marks: 1 },
        { id: "fb8", question: "The ability to put oneself in the position of another is called ________.", marks: 1 },
        { id: "fb9", question: "In arithmetic, the ________ box is used to introduce the concept of zero.", marks: 1 },
        { id: "fb10", question: "________ is the last language skill to develop in children.", marks: 1 }
      ]
    },
    {
      type: "shortAnswer",
      title: "Section C: Short Answer Questions",
      instructions: "Attempt ANY 5 questions. Each question carries 5 marks. Total: 30 Marks",
      totalMarks: 30,
      requiredQuestions: 5,
      questions: [
        { id: "sa1", question: "Define Child Psychology.", marks: 5 },
        { id: "sa2", question: 'What is the difference between "Growth" and "Development"?', marks: 5 },
        { id: "sa3", question: "List the three domains of development.", marks: 5 },
        { id: "sa4", question: "Name the four basic food groups.", marks: 5 },
        { id: "sa5", question: 'Define "Cognitive Development."', marks: 5 },
        { id: "sa6", question: 'What is the role of a teacher as a "facilitator" with students?', marks: 5 },
        { id: "sa7", question: 'Explain the "Four Cs" of food hygiene.', marks: 5 }
      ]
    },
    {
      type: "longAnswer",
      title: "Section D: Long Answer Questions",
      instructions: "Attempt ANY 5 out of 6 questions. Each question carries 10 marks. Total: 50 Marks",
      totalMarks: 50,
      requiredQuestions: 5,
      questions: [
        { id: "la1", question: "Jean Piaget's Theory: Provide a detailed explanation of the four stages of cognitive development and the fundamental concepts like Schema and Assimilation.", marks: 10 },
        { id: "la2", question: "Montessori Method: Discuss the eight key principles of Maria Montessori's approach and its major merits and limitations.", marks: 10 },
        { id: "la3", question: "Lesson Planning: Define a Lesson Plan, discuss the essentials of a good lesson plan, and explain its advantages for a teacher.", marks: 10 },
        { id: "la4", question: "The Play Way Method: Elaborate on the origin, selection of activities, and the physical, social, and emotional values of this method.", marks: 10 },
        { id: "la5", question: 'Technology in Education: Discuss the importance of Technology-Aided Learning and describe the various visual equipments used in a "Smart Class."', marks: 10 },
        { id: "la6", question: "Teacher Qualities and Conduct: Elaborate on the professional responsibilities of a pre-primary teacher and the specific rules of conduct they should follow within school premises.", marks: 10 }
      ]
    }
  ]
};

// ELEMENTARY TEACHER TRAINING EXAM - Full question paper
const elementaryExam = {
  title: "DIPLOMA IN ELEMENTARY TEACHER TRAINING - Final Examination",
  description: "Comprehensive examination for Diploma in Elementary Teacher Training covering education systems, child development, and teaching methodologies.",
  duration: 90, // 90 minutes
  totalMarks: 100,
  passingMarks: 40,
  instructions: `
EXCEL ACADEMY
DIPLOMA IN ELEMENTARY TEACHER TRAINING - FINAL EXAMINATION

Time: 90 Minutes | Maximum Marks: 100

INSTRUCTIONS:
1. This exam consists of 4 sections (A, B, C, D)
2. Section A: Multiple Choice Questions - Attempt ALL questions (5 marks)
3. Section B: Fill in the Blanks - Attempt ALL questions (10 marks)
4. Section C: Short Answer Questions - Attempt ANY 5 out of 6 (25 marks)
5. Section D: Long Answer Questions - Attempt ANY 4 out of 6 (60 marks)
6. Read each question carefully before answering
7. Your exam will auto-submit after 90 minutes
  `.trim(),
  sections: [
    {
      type: "mcq",
      title: "Section A: Multiple Choice Questions",
      instructions: "Attempt all questions. Each question carries 1 mark. Total: 5 Marks",
      totalMarks: 5,
      questions: [
        {
          id: "mcq1",
          question: "Which committee was set up in 1992 to suggest ways to reduce the academic burden on school children?",
          options: ["Kothari Commission", "Yashpal Committee", "Mudaliar Commission", "Durgabai Deshmukh Committee"],
          marks: 1
        },
        {
          id: "mcq2",
          question: "The direction of development that proceeds from the head to the limbs is known as:",
          options: ["Proximodistal", "Cephalo-caudal", "Integration", "Differentiation"],
          marks: 1
        },
        {
          id: "mcq3",
          question: "Which type of thinking focuses on deriving the single best or most often correct answer to a problem?",
          options: ["Divergent thinking", "Reflective thinking", "Convergent thinking", "Abstract thinking"],
          marks: 1
        },
        {
          id: "mcq4",
          question: 'The acronym "DIET" stands for which district-level agency?',
          options: ["District Institute of Educational Technology", "District Institute of Education and Training", "Divisional Institute of Elementary Teaching", "District Information on Educational Training"],
          marks: 1
        },
        {
          id: "mcq5",
          question: "Which commission suggested the uniform 10+2+3 pattern of education for India?",
          options: ["Kothari Commission (1964-66)", "Mudaliar Commission (1952-53)", "Sargent Report", "Yashpal Committee"],
          marks: 1
        }
      ]
    },
    {
      type: "fillBlanks",
      title: "Section B: Fill in the Blanks",
      instructions: "Attempt all questions. Each question carries 2 marks. Total: 10 Marks",
      totalMarks: 10,
      questions: [
        { id: "fb1", question: "The ancient Indian system where education was imparted away from habitations under a Guru is called the ________ system.", marks: 2 },
        { id: "fb2", question: "________ motivation is driven by an internal interest or enjoyment in the task itself rather than external rewards.", marks: 2 },
        { id: "fb3", question: "The full form of CCE is ________ and ________ Evaluation.", marks: 2 },
        { id: "fb4", question: "________ refers to the hardware and software used for information collection, storage, and processing in education.", marks: 2 },
        { id: "fb5", question: "________ is a language based disorder.", marks: 2 }
      ]
    },
    {
      type: "shortAnswer",
      title: "Section C: Short Answer Questions",
      instructions: "Answer ANY 5 questions. Each question carries 5 marks. Total: 25 Marks",
      totalMarks: 25,
      requiredQuestions: 5,
      questions: [
        { id: "sa1", question: "Distinguish between 'Growth' and 'Development' as applied to child psychology.", marks: 5 },
        { id: "sa2", question: "State the primary aims of the National Council of Educational Research and Training (NCERT).", marks: 5 },
        { id: "sa3", question: "What are the identifying features of children with ADHD?", marks: 5 },
        { id: "sa4", question: "Mention the need and importance of using Teaching and learning materials.", marks: 5 },
        { id: "sa5", question: "Explain the importance of use of Technology in Classroom.", marks: 5 },
        { id: "sa6", question: 'What is the difference between "language acquisition" and "language learning"?', marks: 5 }
      ]
    },
    {
      type: "longAnswer",
      title: "Section D: Long Answer Questions",
      instructions: "Answer ANY 4 questions. Each question carries 15 marks. Total: 60 Marks",
      totalMarks: 60,
      requiredQuestions: 4,
      questions: [
        { id: "la1", question: "Describe Jean Piaget's four stages of cognitive development and their implications for classroom teaching.", marks: 15 },
        { id: "la2", question: "Explain any two effective strategies for motivating students to learn.", marks: 15 },
        { id: "la3", question: "What is classroom management? Explain its importance.", marks: 15 },
        { id: "la4", question: "Analyze the role of a teacher as a 'Classroom Manager.' What strategies can be implemented to prevent indiscipline?", marks: 15 },
        { id: "la5", question: "List three characteristics of an effective student-friendly (child-centered) method.", marks: 15 },
        { id: "la6", question: "Explain the core principles of the Play Way method.", marks: 15 }
      ]
    }
  ]
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the course IDs
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title");

    if (!courses || courses.length === 0) {
      return NextResponse.json({ error: "No courses found. Please seed courses first." }, { status: 400 });
    }

    // Find PPTTC course for Pre-Primary exam
    const ppttcCourse = courses.find(c =>
      c.title.toLowerCase().includes("ppttc") ||
      c.title.toLowerCase().includes("pre-primary") ||
      c.title.toLowerCase().includes("pre & primary")
    );

    // Find D.El.Ed or Elementary course
    const elementaryCourse = courses.find(c =>
      c.title.toLowerCase().includes("d.el.ed") ||
      c.title.toLowerCase().includes("elementary") ||
      c.title.toLowerCase().includes("deled")
    );

    const results = [];

    // Create Pre-Primary exam
    if (ppttcCourse) {
      const { data: existingExam } = await supabase
        .from("exams")
        .select("id")
        .eq("title", prePrimaryExam.title)
        .single();

      if (!existingExam) {
        const { data: exam, error } = await supabase
          .from("exams")
          .insert({
            id: generateId(),
            title: prePrimaryExam.title,
            description: prePrimaryExam.description,
            course_id: ppttcCourse.id,
            type: "on_platform",
            exam_type: "on_platform",
            duration: prePrimaryExam.duration,
            total_marks: prePrimaryExam.totalMarks,
            passing_marks: prePrimaryExam.passingMarks,
            instructions: prePrimaryExam.instructions,
            sections: JSON.stringify(prePrimaryExam.sections),
            questions: "[]",
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to create Pre-Primary exam:", error);
          results.push({ exam: "Pre-Primary", status: "failed", error: error.message });
        } else {
          results.push({ exam: "Pre-Primary", status: "created", id: exam?.id, course: ppttcCourse.title });
        }
      } else {
        results.push({ exam: "Pre-Primary", status: "already exists", id: existingExam.id });
      }
    } else {
      results.push({ exam: "Pre-Primary", status: "skipped", reason: "PPTTC course not found" });
    }

    // Create Elementary exam
    if (elementaryCourse) {
      const { data: existingExam } = await supabase
        .from("exams")
        .select("id")
        .eq("title", elementaryExam.title)
        .single();

      if (!existingExam) {
        const { data: exam, error } = await supabase
          .from("exams")
          .insert({
            id: generateId(),
            title: elementaryExam.title,
            description: elementaryExam.description,
            course_id: elementaryCourse.id,
            type: "on_platform",
            exam_type: "on_platform",
            duration: elementaryExam.duration,
            total_marks: elementaryExam.totalMarks,
            passing_marks: elementaryExam.passingMarks,
            instructions: elementaryExam.instructions,
            sections: JSON.stringify(elementaryExam.sections),
            questions: "[]",
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          console.error("Failed to create Elementary exam:", error);
          results.push({ exam: "Elementary", status: "failed", error: error.message });
        } else {
          results.push({ exam: "Elementary", status: "created", id: exam?.id, course: elementaryCourse.title });
        }
      } else {
        results.push({ exam: "Elementary", status: "already exists", id: existingExam.id });
      }
    } else {
      results.push({ exam: "Elementary", status: "skipped", reason: "D.El.Ed course not found" });
    }

    return NextResponse.json({
      message: "Exam seeding completed",
      results,
      availableCourses: courses.map(c => c.title),
    });

  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed exams" }, { status: 500 });
  }
}

export async function GET() {
  // Just return info about what this endpoint does
  return NextResponse.json({
    message: "POST to this endpoint to seed the Pre-Primary and Elementary Teacher Training exams",
    exams: [
      { name: "Pre-Primary Teacher Training", marks: 100, duration: "90 minutes" },
      { name: "Elementary Teacher Training", marks: 100, duration: "90 minutes" },
    ],
  });
}
