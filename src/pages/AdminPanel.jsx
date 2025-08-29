import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { refine, z } from "zod";
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
      language: z.enum(["c++", "java", "javascript"]),
      initialCode: z.string().min(1, "Initial code is required"),
    })
  ),

  referenceSolution: z.array(
    z.object({
      language: z.enum(["c++", "java", "javascript"]),
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
      ],
      referenceSolution: [
        { language: "c++", completeCode: "" },
        { language: "java", completeCode: "" },
        { language: "javascript", completeCode: "" },
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card bg-base-300 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                {...register("title")}
                className={`input input-bordered ${
                  errors.title && "input-error"
                }`}
              />
              {errors.title && (
                <span className="text-error">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                {...register("description")}
                className={`textarea textarea-bordered h-32 ${
                  errors.description && "textarea-error"
                }`}
              ></textarea>
              {errors.description && (
                <span className="text-error">{errors.description.message}</span>
              )}
            </div>

            <div className="flex gap-4">
              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Difficulty</span>
                </label>
                <select
                  {...register("difficulty")}
                  className={`select select-bordered ${
                    errors.difficulty && "select-error"
                  }`}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.difficulty && (
                  <span className="text-error">
                    {errors.difficulty.message}
                  </span>
                )}
              </div>

              <div className="form-control w-1/2">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <select
                  {...register("tags")}
                  className={`select select-bordered ${
                    errors.tags && "select-error"
                  }`}
                >
                  <option value="">Select tags</option>
                  <option value="Array">Array</option>
                  <option value="String">String</option>
                  <option value="Stack">Stack</option>
                  <option value="Queue">Queue</option>
                  <option value="LinkedList">Linked List</option>
                  <option value="Graph">Graph</option>
                  <option value="Heap">Heap</option>
                  <option value="DP">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-300 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Visible TestCases</h3>
              <button
                type="button"
                onClick={() =>
                  appendVisible({ input: "", output: "", explaination: "" })
                }
                className="btn btn-primary btn-sm"
              >
                Add Visible TestCase
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-error btn-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`visibleTestcase.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                <input
                  {...register(`visibleTestcase.${index}.output`)} 
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
                <input
                  {...register(`visibleTestcase.${index}.explaination`)}
                  placeholder="explaination"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Hidden TestCases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: "", output: "" })}
                className="btn btn-primary btn-sm"
              >
                Add Hidden TestCase
              </button>
            </div>

            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-error btn-xs"
                  >
                    Remove
                  </button>
                </div>

                <input
                  {...register(`hiddenTestcase.${index}.input`)}
                  placeholder="Input"
                  className="input input-bordered w-full"
                />
                <input
                  {...register(`hiddenTestcase.${index}.output`)}
                  placeholder="Output"
                  className="input input-bordered w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-base-300 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>
          <div className="space-y-6">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-medium">
                  {index === 0 ? "c++" : index === 1 ? "Java" : "JavaScript"}
                </h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Code</span>
                  </label>
                  <pre className="bg-base-200 p-4 rounded-lg">
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    ></textarea>
                  </pre>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Solution</span>
                  </label>
                  <pre className="bg-base-200 p-4 rounded-lg">
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      className="w-full bg-transparent font-mono"
                      rows={6}
                    ></textarea>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;
