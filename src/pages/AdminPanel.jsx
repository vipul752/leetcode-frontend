import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

const problemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.enum([
    "Array",
    "String",
    "LinkedList",
    "Stack",
    "Queue",
    "Heap",
    "Graph",
    "DP",
  ]),
  visibleTestcase: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
      explaination: z.string().min(1, "explaination is required"),
    })
  ),
  hiddenTestcase: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    })
  ),
  startCode: z.array(
    z.object({
      language: z.enum(["c++", "java", "javascript", "python"]),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ),

  referenceSolution: z.array(
    z.object({
      language: z.enum(["c++", "java", "javascript", "python"]),
      completeCode: z.string().min(1, "Complete code is required"),
    })
  ),
});

const AdminPanel = () => {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: "c++", initialCode: "" },
        { language: "java", initialCode: "" },
        { language: "javascript", initialCode: "" },
        { language: "python", initialCode: "" },
      ],
      referenceSolution: [
        { language: "c++", completeCode: "" },
        { language: "java", completeCode: "" },
        { language: "javascript", completeCode: "" },
        { language: "python", completeCode: "" },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: "visibleTestcase",
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: "hiddenTestcase",
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post("/problem/create", data);
      alert("Problem created successfully");
      navigate("/");
    } catch (error) {
      alert(
        `Error creating problem: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-3">
            Create New Problem
          </h1>
          <p className="text-gray-400 text-lg">
            Design challenging coding problems for your platform
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-gray-600 to-gray-400 mx-auto mt-4 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Card */}
          <div className="card bg-gray-900/80 backdrop-blur-sm shadow-2xl border border-gray-700/50 hover:shadow-white/5 hover:shadow-2xl transition-all duration-300">
            <div className="card-body p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-300">
                      Problem Title
                    </span>
                  </label>
                  <input
                    {...register("title")}
                    className={`input bg-black border-2 ml-4 text-white placeholder-gray-500 focus:bg-gray-900/50 transition-all duration-200 text-base ${
                      errors.title
                        ? "border-red-500 focus:border-red-400"
                        : "border-gray-600 focus:border-gray-400"
                    }`}
                    placeholder="Enter a descriptive problem title..."
                  />
                  {errors.title && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 text-red-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-400 text-sm">
                        {errors.title.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold text-gray-300">
                      Problem Description
                    </span>
                  </label>
                  <textarea
                    {...register("description")}
                    className={`textarea bg-black border-2 ml-4 text-white placeholder-gray-500 focus:bg-gray-900/50 transition-all duration-200 text-base resize-none ${
                      errors.description
                        ? "border-red-500 focus:border-red-400"
                        : "border-gray-600 focus:border-gray-400"
                    }`}
                    rows={5}
                    placeholder="Provide a detailed description of the problem, including constraints and requirements..."
                  ></textarea>
                  {errors.description && (
                    <div className="flex items-center mt-2">
                      <svg
                        className="w-4 h-4 text-red-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-400 text-sm">
                        {errors.description.message}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text mb-4 text-base font-semibold text-gray-300">
                        Difficulty Level
                      </span>
                    </label>
                    <select
                      {...register("difficulty")}
                      className={`select  bg-black border-2 text-white focus:bg-gray-900/50 transition-all duration-200 text-base ${
                        errors.difficulty
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-600 focus:border-gray-400"
                      }`}
                    >
                      <option value="" className="bg-gray-900">
                        Choose difficulty level
                      </option>
                      <option value="Easy" className="bg-gray-900">
                        Easy
                      </option>
                      <option value="Medium" className="bg-gray-900">
                        Medium
                      </option>
                      <option value="Hard" className="bg-gray-900">
                        Hard
                      </option>
                    </select>
                    {errors.difficulty && (
                      <div className="flex items-center mt-2">
                        <svg
                          className="w-4 h-4 text-red-400 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-red-400 text-sm">
                          {errors.difficulty.message}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text mb-4 text-base font-semibold text-gray-300">
                        Category Tags
                      </span>
                    </label>
                    <select
                      {...register("tags")}
                      className={`select bg-black border-2 text-white focus:bg-gray-900/50 transition-all duration-200 text-base ${
                        errors.tags
                          ? "border-red-500 focus:border-red-400"
                          : "border-gray-600 focus:border-gray-400"
                      }`}
                    >
                      <option value="" className="bg-gray-900">
                        Select category
                      </option>
                      <option value="Array" className="bg-gray-900">
                        Array
                      </option>
                      <option value="String" className="bg-gray-900">
                        String
                      </option>
                      <option value="Stack" className="bg-gray-900">
                        Stack
                      </option>
                      <option value="Queue" className="bg-gray-900">
                        Queue
                      </option>
                      <option value="LinkedList" className="bg-gray-900">
                        Linked List
                      </option>
                      <option value="Graph" className="bg-gray-900">
                        Graph
                      </option>
                      <option value="Heap" className="bg-gray-900">
                        Heap
                      </option>
                      <option value="DP" className="bg-gray-900">
                        Dynamic Programming
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Cases Card */}
          <div className="card bg-gray-900/80 backdrop-blur-sm shadow-2xl border border-gray-700/50 hover:shadow-white/5 hover:shadow-2xl transition-all duration-300">
            <div className="card-body p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Test Cases</h2>
              </div>

              {/* Visible Test Cases */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-lg shadow-green-500/50"></span>
                    <h3 className="text-lg font-semibold text-gray-200">
                      Visible Test Cases
                    </h3>
                    {/* <span className="ml-2 text-sm text-gray-400">
                      (shown to users)
                    </span> */}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      appendVisible({ input: "", output: "", explaination: "" })
                    }
                    className="btn bg-gradient-to-r from-green-600 to-green-500 text-white border-0 hover:from-green-500 hover:to-green-400 transition-all duration-200 btn-sm shadow-lg hover:shadow-green-500/30"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Test Case
                  </button>
                </div>

                <div className="space-y-4">
                  {visibleFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-gray-800/60 border border-green-500/20 p-6 rounded-xl hover:shadow-lg hover:shadow-green-500/10 hover:border-green-500/30 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="badge bg-gradient-to-r from-green-600 to-green-500 text-white border-0 shadow-lg">
                          Test Case {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVisible(index)}
                          className="btn bg-red-600 hover:bg-red-500 text-white border-0 btn-xs transition-all duration-200 shadow-lg"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium text-gray-300">
                              Input
                            </span>
                          </label>
                          <input
                            {...register(`visibleTestcase.${index}.input`)}
                            placeholder="Example: [1,2,3]"
                            className="input bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-green-400 focus:bg-gray-900/30 transition-all duration-200"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium text-gray-300">
                              Expected Output
                            </span>
                          </label>
                          <input
                            {...register(`visibleTestcase.${index}.output`)}
                            placeholder="Example: 6"
                            className="input bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-green-400 focus:bg-gray-900/30 transition-all duration-200"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium text-gray-300">
                              Explanation
                            </span>
                          </label>
                          <input
                            {...register(
                              `visibleTestcase.${index}.explaination`
                            )}
                            placeholder="Brief explanation..."
                            className="input bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-green-400 focus:bg-gray-900/30 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hidden Test Cases */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2 shadow-lg shadow-orange-500/50"></span>
                    <h3 className="text-lg font-semibold text-gray-200">
                      Hidden Test Cases
                    </h3>
                    {/* <span className="ml-2 text-sm text-gray-400">
                      (for evaluation only)
                    </span> */}
                  </div>
                  <button
                    type="button"
                    onClick={() => appendHidden({ input: "", output: "" })}
                    className="btn bg-gradient-to-r from-orange-600 to-orange-500 text-white border-0 hover:from-orange-500 hover:to-orange-400 transition-all duration-200 btn-sm shadow-lg hover:shadow-orange-500/30"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Hidden Test
                  </button>
                </div>

                <div className="space-y-4">
                  {hiddenFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-gray-800/60 border border-orange-500/20 p-6 rounded-xl hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/30 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="badge bg-gradient-to-r from-orange-600 to-orange-500 text-white border-0 shadow-lg">
                          Hidden Test {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeHidden(index)}
                          className="btn bg-red-600 hover:bg-red-500 text-white border-0 btn-xs transition-all duration-200 shadow-lg"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="grid  gap-2">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium mr-2  text-gray-300">
                              Input
                            </span>
                          </label>
                          <input
                            {...register(`hiddenTestcase.${index}.input`)}
                            placeholder="Test input..."
                            className="input bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-orange-400 focus:bg-gray-900/30 transition-all duration-200"
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text mr-2 font-medium text-gray-300">
                              Expected Output
                            </span>
                          </label>
                          <input
                            {...register(`hiddenTestcase.${index}.output`)}
                            placeholder="Expected result..."
                            className="input bg-black border border-gray-600 text-white placeholder-gray-500 focus:border-orange-400 focus:bg-gray-900/30 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Code Templates Card */}
          <div className="card bg-gray-900/80 backdrop-blur-sm shadow-2xl border border-gray-700/50 hover:shadow-white/5 hover:shadow-2xl transition-all duration-300">
            <div className="card-body p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Code Templates
                </h2>
              </div>

              <div className="space-y-8">
                {[0, 1, 2, 3].map((index) => {
                  const languages = [
                    {
                      name: "C++",
                      color: "from-gray-600 to-gray-500",
                      icon: "",
                      textColor: "text-gray-300",
                    },
                    {
                      name: "Java",
                      color: "from-red-600 to-red-500",
                      icon: "",
                      textColor: "text-red-300",
                    },
                    {
                      name: "JavaScript",
                      color: "from-yellow-600 to-yellow-500",
                      icon: "",
                      textColor: "text-yellow-300",
                    },
                    {
                      name: "Python",
                      color: "from-blue-600 to-blue-500",
                      icon: "",
                      textColor: "text-blue-300",
                    },
                  ];
                  const lang = languages[index];

                  return (
                    <div
                      key={index}
                      className="bg-gray-800/40 border border-gray-600/30 rounded-xl p-6 hover:shadow-lg hover:shadow-white/5 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div className="flex items-center mb-6">
                        <span
                          className={`badge bg-gradient-to-r ${lang.color} text-white border-0 text-lg px-4 py-3 shadow-lg`}
                        >
                          {lang.icon} {lang.name}
                        </span>
                      </div>

                      <div className="space-y-6">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold text-gray-300 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Initial Code Template
                            </span>
                          </label>
                          <div className="bg-black rounded-lg border border-gray-700 overflow-hidden shadow-xl">
                            <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                              <span
                                className={`text-sm font-mono flex items-center ${lang.textColor}`}
                              >
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                {lang.name} Template
                              </span>
                            </div>
                            <textarea
                              {...register(`startCode.${index}.initialCode`)}
                              className="w-full bg-black text-green-400 font-mono text-sm p-4 resize-none border-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              rows={8}
                              placeholder={`// ${lang.name} starter code template\n// Define function signature and basic structure here`}
                            ></textarea>
                          </div>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold text-gray-300 flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                              </svg>
                              Reference Solution
                            </span>
                          </label>
                          <div className="bg-black rounded-lg border border-gray-700 overflow-hidden shadow-xl">
                            <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                              <span
                                className={`text-sm font-mono flex items-center ${lang.textColor}`}
                              >
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                {lang.name} Solution
                              </span>
                            </div>
                            <textarea
                              {...register(
                                `referenceSolution.${index}.completeCode`
                              )}
                              className="w-full bg-black text-gray-300 font-mono text-sm p-4 resize-none border-0 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              rows={8}
                              placeholder={`// Complete ${lang.name} solution\n// Include the full working implementation here`}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <button
              type="submit"
              className="btn bg-gradient-to-r from-gray-700 to-gray-600 text-white border-0 hover:from-gray-600 hover:to-gray-500 transition-all duration-300 text-lg px-12 py-4 shadow-2xl hover:shadow-white/10 transform hover:scale-105 hover:-translate-y-1"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Problem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;
